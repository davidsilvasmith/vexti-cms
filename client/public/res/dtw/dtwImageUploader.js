define([
	"jquery",
	"underscore",
	"crel",
	"utils",
	"classes/Extension",
	"mousetrap",
	"rangy",
	"yaml-js",
	"text!dtw/dtwImageUploader.html",
	"text!dtw/dtwImageUploaderSettingsBlock.html"
], function($, _, crel, utils, Extension, mousetrap, rangy, YAML, dtwImageUploaderHTML, dtwImageUploaderSettingsBlockHTML) {

	console.log('loading dtwImageUploader');
	
	var dtwImageUploader = new Extension("dtwImageUploader", 'Publish file', true, true);
	dtwImageUploader.settingsBlock = dtwImageUploaderSettingsBlockHTML;
	dtwImageUploader.defaultConfig = {
		dtwImageUploaderShortcut: 'mod+j'
	};

	dtwImageUploader.onLoadSettings = function() {
		utils.setInputValue("#input-find-replace-shortcut", dtwImageUploader.config.dtwImageUploaderShortcut);
	};

	dtwImageUploader.onSaveSettings = function(newConfig, event) {
		newConfig.dtwImageUploaderShortcut = utils.getInputTextValue("#input-find-replace-shortcut", event);
	};

	var editor;
	dtwImageUploader.onEditorCreated = function(editorParam) {
		editor = editorParam;
	};

	var eventMgr;
	dtwImageUploader.onEventMgrCreated = function(eventMgrParam) {
		eventMgr = eventMgrParam;

		eventMgr.addEventHook("onDtwProviderCreated");
	};


	var fileMgr;
	dtwImageUploader.onFileMgrCreated = function(fileMgrParam) {
		fileMgr = fileMgrParam;
	};

    var synchronizer;
	dtwImageUploader.onSynchronizerCreated = function(syncParam) {
		synchronizer = syncParam;
	}

	var dtwProvider;

	dtwImageUploader.onDtwProviderCreated = function(dtwParam) {
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
    	$("#dtwImageUploader-input").text(path);

		var newPath = fixPathForMarkdownAndStackedit(dtwFileDesc._title);

    	var lastPeriod = newPath.lastIndexOf(".");
    	if (lastPeriod > 0) {
    		newPath = newPath.substring(0, lastPeriod);
    	}
		if (newPath) {
			$('#dtwImageUploader-input').val(newPath.replace(/\s+/g, '-').toLowerCase());
			}
		editor.selectionMgr.adjustTop = 50;
		editor.selectionMgr.adjustBottom = 220;
	}

	function fixPathForMarkdownAndStackedit (original) {
		var newPath = original.replace(/_/g, '');
    	var newPath = newPath.replace(/:/g, '');
		var newPath = newPath.replace(/ /g, '-');
		return newPath;
	}

	function hide() {
		shown = false;
		$findReplaceElt.hide();
		editor.selectionMgr.adjustTop = 0;
		editor.selectionMgr.adjustBottom = 0;
		editor.focus();
	}

	dtwImageUploader.onEditorPopover = function() {
		hide();
	};

	function doCoverUpload() {
		//$('#fileUploaderOutput').text('');
		console.log("submit cover");
            var fd = new FormData(document.getElementById("uploadFormCover"));
            //fd.append("label", "WEBUPLOAD");
            $.ajax({
              url: "/system/upload",
              type: "POST",
              data: fd,
              enctype: 'multipart/form-data',
              processData: false,  // tell jQuery not to process the data
              contentType: false   // tell jQuery not to set contentType
            }).done(function( data ) {
                console.log("Server Output:");
                console.log( data );
                //$('#fileUploaderOutput').text(data);
                $('#coverImageUploadPath').text(data);              
            });
            return false;
	}

	function doFMImageUpload() {
		//$('#fileUploaderOutput').text('');
		console.log("submit image");
            var fd = new FormData(document.getElementById("uploadFormImage"));
            //fd.append("label", "WEBUPLOAD");
            $.ajax({
              url: "/system/upload",
              type: "POST",
              data: fd,
              enctype: 'multipart/form-data',
              processData: false,  // tell jQuery not to process the data
              contentType: false   // tell jQuery not to set contentType
            }).done(function( data ) {
                console.log("Server Output:");
                console.log( data );
                //$('#fileUploaderOutput').text(data);
                $('#imageUploadPath').text(data);              
            });
            return false;
	}

		function doImageUpload() {
		$('#fileUploaderOutput').text('');
		console.log("submit image");
            var fd = new FormData(document.getElementById("uploadForm"));
            //fd.append("label", "WEBUPLOAD");
            $.ajax({
              url: "/system/upload",
              type: "POST",
              data: fd,
              enctype: 'multipart/form-data',
              processData: false,  // tell jQuery not to process the data
              contentType: false   // tell jQuery not to set contentType
            }).done(function( data ) {
                console.log("Server Output:");
                console.log( data );
                $('#fileUploaderOutput').text(data);
            });
            return false;
	}

	function onOpen(fileDescParam, content) {
    	dtwFileDesc = fileDescParam;
    	$('#dtwImageUploader-filename').val('testFile');
	}
	
	//dtwFrontMatterEditor.onFileOpen = _.bind(highlight, null, true);

	dtwImageUploader.onReady = function() {
		var elt = crel('div', {
			class: 'find-replace'
		});
		$findReplaceElt = $(elt).hide();
		elt.innerHTML = dtwImageUploaderHTML;
		document.querySelector('.layout-wrapper-l2').appendChild(elt);
		$('.dtwImageuploader-dismiss').click(function() {
			hide();
		});		
		$('.btn-upload-image').click(doImageUpload);
		$('.btn-upload-FMimage').click(doFMImageUpload);
		$('.btn-upload-cover').click(doCoverUpload);

		// Key bindings
		$().add($searchForInputElt).keydown(function(evt) {
			if(evt.which === 13) {
				// Enter key
				evt.preventDefault();
				find();
			}
		});

		$(".action-upload-image").click(function() {
            show();
        });

		mousetrap.bind(dtwImageUploader.config.dtwImageUploaderShortcut, function(e) {
			show();
			e.preventDefault();
		});
	};

	dtwImageUploader.onContentChanged = onOpen;
	dtwImageUploader.onFileOpen = onOpen;

	console.log('done loading dtwImageUploader');

	return dtwImageUploader;
});
