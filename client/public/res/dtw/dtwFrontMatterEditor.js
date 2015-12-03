/*
any references to find and replace are because this was modeled after find / replace.
*/

define([
	"jquery",
	"underscore",
	"crel",
	"utils",
	"classes/Extension",
	"mousetrap",
	"rangy",
	"yaml-js",
	"text!dtw/dtwFrontMatterEditor.html",
	"text!dtw/dtwFrontMatterEditorSettingsBlock.html"
], function($, _, crel, utils, Extension, mousetrap, rangy, YAML, dtwFrontMatterEditorHTML, dtwFrontMatterEditorSettingsBlockHTML) {

	var dtwFrontMatterEditor = new Extension("dtwFrontMatterEditor", 'Edit Front Matter', true, true);
	dtwFrontMatterEditor.settingsBlock = dtwFrontMatterEditorSettingsBlockHTML;
	dtwFrontMatterEditor.defaultConfig = {
		dtwFrontMatterEditorShortcut: 'mod+m'
	};

	dtwFrontMatterEditor.onLoadSettings = function() {
		utils.setInputValue("#input-find-replace-shortcut", dtwFrontMatterEditor.config.dtwFrontMatterEditorShortcut);
	};

	dtwFrontMatterEditor.onSaveSettings = function(newConfig, event) {
		newConfig.dtwFrontMatterEditorShortcut = utils.getInputTextValue("#input-find-replace-shortcut", event);
	};

	var editor;
	dtwFrontMatterEditor.onEditorCreated = function(editorParam) {
		editor = editorParam;
	};

	var eventMgr;
	dtwFrontMatterEditor.onEventMgrCreated = function(eventMgrParam) {
		eventMgr = eventMgrParam;
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
		if(dtwFileDesc.frontMatter) {
			$('.dtwFrontMatterEditor-input').val(dtwFileDesc.frontMatter._yaml);
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

	dtwFrontMatterEditor.onEditorPopover = function() {
		hide();
	};

	//consider trimming empty lines (they get added at the end)
	//when trapping an error consider displaying it to the user.
	function save() {
		console.log('in frontmattereditor');
		//if(!dtwFileDesc.frontMatter) {
		//	hide();
		//	return;
		//}
		var remove;
		if (dtwFileDesc.frontMatter && dtwFileDesc.frontMatter._yaml) {
			remove = dtwFileDesc.frontMatter._yaml;
		}
		var newFrontMatter = $('.dtwFrontMatterEditor-input').val();
		var b;
		try {
			console.log('trying to parse');
			var b = YAML.parse(newFrontMatter);	
			console.log('done parsing', b);
		}
		catch(err) {
			console.log("yaml parser", err);
			var errMessage ="";
			if (err.rawMessage) {
				errMessage += "Error message: " + err.rawMessage;
			}
			if (err.parsedLine) {
				errMessage += " Line: " + err.parsedLine;
			}
			if (err.snippet) {
				errMessage += 	" Snippet: " + err.snippet;
			}
			 
			eventMgr.onError("Invalid FrontMatter. " + errMessage);
			return;
		}
		
		console.log("b", b);
		var isValidYaml = (b !== null && typeof b === 'object' && !(b instanceof String));
		if (isValidYaml){
			console.log("is valid");
			//replaceAll(search, replacement)
			if(remove) {
				editor.replaceAll(remove, newFrontMatter);
			}
			else {
				console.log('editor', editor);
				content = editor.getValue();
				newContent = '---\n' + newFrontMatter + '\n---\n' + content;
				console.log('newContent', newContent);
				editor.setValue(newContent);
			}
			//var saveMe = dtwFileDesc.content.replace(remove, newFrontMatter);
			//eventMgr.onContentChanged(dtwFileDesc, saveMe);	
			hide();
		}
		else {
			eventMgr.onError("Invalid FrontMatter. Please fix and retry.");
		}
	}

	function onOpen(fileDescParam, content) {
    	dtwFileDesc = fileDescParam;
	}
	
	//dtwFrontMatterEditor.onFileOpen = _.bind(highlight, null, true);

	dtwFrontMatterEditor.onReady = function() {
		var elt = crel('div', {
			class: 'find-replace'
		});
		$findReplaceElt = $(elt).hide();
		elt.innerHTML = dtwFrontMatterEditorHTML;
		document.querySelector('.layout-wrapper-l2').appendChild(elt);
		$('.dtwFrontMatterEditor-dismiss').click(function() {
			hide();
		});		
		$('.btn-primary-save-front-matter').click(save);

		// Key bindings
		$().add($searchForInputElt).keydown(function(evt) {
			if(evt.which === 13) {
				// Enter key
				evt.preventDefault();
				find();
			}
		});

		$(".action-frontmatter-edit").click(function() {
            show();
        });

		mousetrap.bind(dtwFrontMatterEditor.config.dtwFrontMatterEditorShortcut, function(e) {
			show();
			e.preventDefault();
		});
	};

	dtwFrontMatterEditor.onContentChanged = onOpen;
	dtwFrontMatterEditor.onFileOpen = onOpen;

	return dtwFrontMatterEditor;
});
