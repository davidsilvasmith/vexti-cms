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
		console.log("in onLoadSettings");
		console.log(dtwFrontMatterEditor.config);
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
		loadCurrentFrontMatter();
		//console.log("CHECKING FRONTMATTER:");
		//console.log(dtwFileDesc.frontMatter.title);
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

	function loadCurrentFrontMatter(){
		//console.log("loading frontmatter data...");
		document.getElementById("title").value = dtwFileDesc.frontMatter.title;
		document.getElementById("post").value = dtwFileDesc.frontMatter.popularPostTitle;
		document.getElementById("summary").value = dtwFileDesc.frontMatter.excerpt;
		document.getElementById("permalink").value = dtwFileDesc.frontMatter.permalink;
		document.getElementById("coverImageUploadPath").innerHTML = dtwFileDesc.frontMatter.coverImage;
		document.getElementById("imageUploadPath").innerHTML = dtwFileDesc.frontMatter.image;

		document.getElementById("coverImg").src = dtwFileDesc.frontMatter.coverImage;
		document.getElementById("imageImg").src = dtwFileDesc.frontMatter.image;

		//will set inouts to empty rather than displaying undefined
		if(dtwFileDesc.frontMatter.title == undefined)
			document.getElementById("title").value = " ";
		if(dtwFileDesc.frontMatter.popularPostTitle == undefined)
			document.getElementById("post").value = " ";
		if(dtwFileDesc.frontMatter.excerpt == undefined)
			document.getElementById("summary").value = " ";
		if(dtwFileDesc.frontMatter.permalink == undefined)
			document.getElementById("permalink").value = " ";
		if(dtwFileDesc.frontMatter.image == undefined)
			document.getElementById("imageImg").src = "res/img/placeholder.png";
		if(dtwFileDesc.frontMatter.coverImage == undefined)
			document.getElementById("coverImg").src = "res/img/placeholder.png";

		//console.log("frontmatter load completed");
	};

	dtwFrontMatterEditor.onEditorPopover = function() {
		hide();
	};

	//takes inputs from text boxes and put it into a format yaml can parse
	function createFrontMatter(){
		console.log("createFrontMatter was called");
		var title = document.getElementById("title").value;
		var post = document.getElementById("post").value;
		var summary = document.getElementById("summary").value;
		var permalink = document.getElementById("permalink").value;
		var cover = document.getElementById("coverImageUploadPath").innerHTML;
		var image = document.getElementById("imageUploadPath").innerHTML;

		cover = fixImagePath(cover);
		image = fixImagePath(image);

		title = "title: ".concat(title).concat("\n");
		post = "popularPostTitle: ".concat(post).concat("\n");
		summary = "excerpt: ".concat(summary).concat("\n");
		permalink = "permalink: ".concat(permalink).concat("\n");
		cover = "coverImage: ".concat(cover).concat("\n");
		image = "image: ".concat(image).concat("\n");
		
		console.log('listing yml elements:\n');

		console.log(title);
		console.log(post);
		console.log(summary);
		console.log(permalink);
		console.log(cover);
		console.log(image);

		return title.concat(post).concat(summary).concat(permalink).concat(cover).concat(image);
	};

	function fixImagePath(imagePath){
		var cutoff = imagePath.lastIndexOf('/');
		imagePath = imagePath.substr(cutoff,imagePath.length);
		return imagePath;
	};
	
	//consider trimming empty lines (they get added at the end)
	//when trapping an error consider displaying it to the user.
	function save() {
		console.log("save called");
		var newFrontMatter = createFrontMatter();
		console.log("createFrontMatter ran successfully");
		//if(!dtwFileDesc.frontMatter) {
		//	hide();
		//	return;
		//}
		var remove;
		if (dtwFileDesc.frontMatter && dtwFileDesc.frontMatter._yaml) {
			remove = dtwFileDesc.frontMatter._yaml;
		}

		//var newFrontMatter = $('.dtwFrontMatterEditor-input').val();
		///console.log(newFrontMatter);
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
