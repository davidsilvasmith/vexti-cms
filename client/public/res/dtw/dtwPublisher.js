define([
	"jquery",
	"underscore",
	"crel",
	"utils",
	"classes/Extension",
	"mousetrap",
	"rangy",
	"yaml-js",
	"text!dtw/dtwPublisher.html",
	"text!dtw/dtwPublisherSettingsBlock.html"
], function($, _, crel, utils, Extension, mousetrap, rangy, YAML, dtwPublisherHTML, dtwPublisherSettingsBlockHTML) {

	console.log('loading dtwPublisher');
	
	var dtwPublisher = new Extension("dtwPublisher", 'Publish file', true, true);
	dtwPublisher.settingsBlock = dtwPublisherSettingsBlockHTML;
	dtwPublisher.defaultConfig = {
		dtwPublisherShortcut: 'mod+p'
	};

	dtwPublisher.onLoadSettings = function() {
		utils.setInputValue("#input-find-replace-shortcut", dtwPublisher.config.dtwPublisherShortcut);
	};

	dtwPublisher.onSaveSettings = function(newConfig, event) {
		newConfig.dtwPublisherShortcut = utils.getInputTextValue("#input-find-replace-shortcut", event);
	};

	var editor;
	dtwPublisher.onEditorCreated = function(editorParam) {
		editor = editorParam;
	};

	var eventMgr;
	dtwPublisher.onEventMgrCreated = function(eventMgrParam) {
		eventMgr = eventMgrParam;

		eventMgr.addEventHook("onDtwProviderCreated");
	};


	var fileMgr;
	dtwPublisher.onFileMgrCreated = function(fileMgrParam) {
		fileMgr = fileMgrParam;
	};

    var synchronizer;
	dtwPublisher.onSynchronizerCreated = function(syncParam) {
		synchronizer = syncParam;
	}

	var dtwProvider;

	dtwPublisher.onDtwProviderCreated = function(dtwParam) {
		dtwProvider = dtwParam;
		dtwProvider.controlFileMgr();
	};

	var contentElt;
	var $searchForInputElt;
	var $findReplaceElt;

	var shown = false;
	var dtwFileDesc;

	function show() {
		eventMgr.onEditorPopover();
		shown = true;
		$findReplaceElt.show();
		var path;
		for (var attr in dtwFileDesc.syncLocations) {
			var location = dtwFileDesc.syncLocations[attr];
			if (location.etag) {
				path = location.etag;
			}
		}
    	$("#dtwPublisher-filename").text(path);
		if(dtwFileDesc.frontMatter && dtwFileDesc.frontMatter._yaml) {
			var data = YAML.parse(dtwFileDesc.frontMatter._yaml);
			if (data.title) {
				///_posts/2015-03-04-rebuttal-3-reasons-why-bitcoin-wont-be-the-new-internet.md
				var rightNow = new Date();
				var res = rightNow.toISOString().slice(0,10);
				var prefix = '_posts/' + res + '-';
				$('.dtwPublisher-input').val(prefix + data.title.replace(/\s+/g, '-').toLowerCase() + '.md');	
			}
			
		}
		editor.selectionMgr.adjustTop = 50;
		editor.selectionMgr.adjustBottom = 220;
		//highlight(true);
	}

	function hide() {
		shown = false;
		$findReplaceElt.hide();
		editor.selectionMgr.adjustTop = 0;
		editor.selectionMgr.adjustBottom = 0;
		editor.focus();
	}

	dtwPublisher.onEditorPopover = function() {
		hide();
	};

	function save() {
		var fileSavePath = $('.dtwPublisher-input').val();
		//dtwProvider.createFile = function(content, post, title, folder) {
        var fileContent = editor.getValue();
        var savedFile = dtwProvider.createFile(fileContent, fileSavePath, fileSavePath);
        fileMgr.deleteFile(dtwFileDesc);
        fileMgr.selectFile(savedFile);
        hide();
	}

	function onOpen(fileDescParam, content) {
		console.log('in onOpen');
    	dtwFileDesc = fileDescParam;
    	$('#dtwPublisher-filename').val('testFile');
	}
	
	//dtwFrontMatterEditor.onFileOpen = _.bind(highlight, null, true);

	dtwPublisher.onReady = function() {
		var elt = crel('div', {
			class: 'find-replace'
		});
		$findReplaceElt = $(elt).hide();
		elt.innerHTML = dtwPublisherHTML;
		document.querySelector('.layout-wrapper-l2').appendChild(elt);
		$('.dtwPublisher-dismiss').click(function() {
			hide();
		});		
		$('.btn-publish-draft').click(save);

		// Key bindings
		$().add($searchForInputElt).keydown(function(evt) {
			if(evt.which === 13) {
				// Enter key
				evt.preventDefault();
				find();
			}
		});

		$(".action-stage").click(function() {
            show();
        });

		mousetrap.bind(dtwPublisher.config.dtwPublisherShortcut, function(e) {
			show();
			e.preventDefault();
		});
	};

	dtwPublisher.onContentChanged = onOpen;
	dtwPublisher.onFileOpen = onOpen;

	console.log('done loading dtwPublisher');

	return dtwPublisher;
});
