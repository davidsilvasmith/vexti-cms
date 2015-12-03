define([
	"jquery",
	"underscore",
	"crel",
	"constants",
	"utils",
	"classes/Extension",
	"mousetrap",
	"rangy",
	"yaml-js",
	"text!dtw/dtwPusher.html",
	"text!dtw/dtwPusherSettingsBlock.html"
], function($, _, crel, constants, utils, Extension, mousetrap, rangy, YAML, dtwPusherHTML, dtwPusherSettingsBlockHTML) {

	console.log('loading dtwPusher');
	
	var dtwPusher = new Extension("dtwPusher", 'Push file', true, true);
	dtwPusher.settingsBlock = dtwPusherSettingsBlockHTML;
	dtwPusher.defaultConfig = {
		dtwPusherShortcut: 'mod+k'
	};

	dtwPusher.onLoadSettings = function() {
		utils.setInputValue("#input-find-replace-shortcut", dtwPusher.config.dtwPusherShortcut);
	};

	dtwPusher.onSaveSettings = function(newConfig, event) {
		newConfig.dtwPusherShortcut = utils.getInputTextValue("#input-find-replace-shortcut", event);
	};

	var editor;
	dtwPusher.onEditorCreated = function(editorParam) {
		editor = editorParam;
	};

	var eventMgr;
	dtwPusher.onEventMgrCreated = function(eventMgrParam) {
		eventMgr = eventMgrParam;

		eventMgr.addEventHook("onDtwProviderCreated");
	};

	var fileMgr;
	dtwPusher.onFileMgrCreated = function(fileMgrParam) {
		fileMgr = fileMgrParam;
	};

    var synchronizer;
	dtwPusher.onSynchronizerCreated = function(syncParam) {
		synchronizer = syncParam;
	}

	var dtwProvider;

	dtwPusher.onDtwProviderCreated = function(dtwParam) {
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
		editor.selectionMgr.adjustTop = 50;
		editor.selectionMgr.adjustBottom = 220;
	}

	function hide() {
		shown = false;
		$findReplaceElt.hide();
		editor.selectionMgr.adjustTop = 0;
		editor.selectionMgr.adjustBottom = 0;
		editor.focus();
	}

	dtwPusher.onEditorPopover = function() {
		hide();
	};

	function pushToRepo() {
		console.log('Pushing to repo');
		var command = $('.dtwPusher-input').val();
        //curl --data "command=git status" /system/git

        var d = { command: command };

        $.ajax({
            type: "POST",
            url: '/system/git',
            data: d,
            dataType: "text",
            timeout: constants.AJAX_TIMEOUT
        })
        .fail(function(jqXHR) {
                    var error = {
                        code: jqXHR.status,
                        message: jqXHR.statusText
                    };
                    console.log('error', error);
                })
        .done(function( data ) {
            console.log('data', data);
            $('#dtwPusher-result').text(data);
        });
	}

	function onOpen(fileDescParam, content) {
    	dtwFileDesc = fileDescParam;
    	$('#dtwPusher-filename').val('testFile');
	}
	
	//dtwFrontMatterEditor.onFileOpen = _.bind(highlight, null, true);

	dtwPusher.onReady = function() {
		var elt = crel('div', {
			class: 'find-replace'
		});
		$findReplaceElt = $(elt).hide();
		elt.innerHTML = dtwPusherHTML;
		document.querySelector('.layout-wrapper-l2').appendChild(elt);
		$('.dtwPusher-dismiss').click(function() {
			hide();
		});		
		$('.btn-publish-draft').click(pushToRepo);

		// Key bindings
		$().add($searchForInputElt).keydown(function(evt) {
			if(evt.which === 13) {
				// Enter key
				evt.preventDefault();
				find();
			}
		});

		console.log('binding publish file');
		$(".action-publish-file").click(function() {
			console.log('in publish file');
            show();
        });

		console.log('bound publish file');
		mousetrap.bind(dtwPusher.config.dtwPusherShortcut, function(e) {
			//var newSearch = editor.selectionMgr.getSelectedText();
			//if(newSearch) {
			//	$searchForInputElt.val(newSearch);
			//}
			show();
			e.preventDefault();
		});
	};

	console.log('done loading dtwPusher');

	return dtwPusher;
});
