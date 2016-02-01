define([
    "jquery",
    "utils",
    "classes/Provider",
    "extensions/documentManager",
    "constants",
    "logger",
    "fileSystem",
    "classes/AsyncTask",
    "fileMgr",
    "eventMgr"
], function ($, utils, Provider, documentManager, constants, logger, fileSystem, AsyncTask, fileMgr, eventMgr) {
    var providerId = "dtw";
    var dtwProvider = new Provider(providerId, "DtwFile");
    
    dtwProvider.publishPreferencesInputIds = [
        "dtw-public"
    ];
    dtwProvider.viewerSharingAttributes = [
        "dtwId",
        "filename"
    ];

    var merge = true;

    dtwProvider.getPublishLocationLink = function(attributes) {
        return [
            '/saveFile/',
            attributes.dtwId
        ].join('');
    };

    dtwProvider.importFiles = function() {
        console.log('in importFiles');
    };

    dtwProvider.exportFile =  function(event, title, content, discussionListJSON, frontMatter, callback) {
        console.log('in importFiles', event, title, content, discussionListJSON, frontMatter, callback);
    };

    dtwProvider.syncDown = function(callback) {

        console.log('in syncDown');
        return callback();
    };

    dtwProvider.syncUp = function(content, contentCRC, title, titleCRC, discussionList, discussionListCRC, frontMatter, syncAttributes, callback) {
        //console.log('in syncUp', syncAttributes);
        if(
            (syncAttributes.contentCRC == contentCRC) && // Content CRC hasn't changed
            (syncAttributes.discussionListCRC == discussionListCRC) // Discussion list CRC hasn't changed
        ) {
            //console.log("no changes, returning");
            return callback(undefined, false);
        }
        var uploadedContent = dtwProvider.serializeContent(content, discussionList);

        console.log("about to upload");
        dtwProvider.upload(syncAttributes.etag, uploadedContent, function(error, result) {
            console.log("uploading", syncAttributes.etag);
            console.log("uploading result", result);

            if(error) {
                //console.log("in error");
                return callback(error, true);
            }
            //syncAttributes.version = result.versionTag;
            if(merge === true) {
                // Need to store the whole content for merge
                syncAttributes.content = content;
                syncAttributes.discussionList = discussionList;
            }
            syncAttributes.contentCRC = contentCRC;
            syncAttributes.titleCRC = titleCRC; // Not synchronized but has to be there for syncMerge
            syncAttributes.discussionListCRC = discussionListCRC;
            //console.log("doing callback");
            callback(undefined, true);
        });
    };

    dtwProvider.upload = function(path, content, callback) {
        var result = [];
        var task = new AsyncTask();
        //connect(task);
        //authenticate(task);
        task.onRun(function() {
            function write() {
                var d = {
                        content: content,
                        markdownPath: path
                    };

                console.log("d", d);

                $.ajax({
                    type: "POST",
                    url: '/saveFile',
                    data: d,
                    dataType: "text",
                    timeout: constants.AJAX_TIMEOUT
                })
                .fail(function(jqXHR) {
                            var error = {
                                code: jqXHR.status,
                                message: jqXHR.statusText
                            };
                            console.log('in fail upload');
                            handleError(error, task);
                        })
                .done(function( data ) {
                    result = data;
                    task.chain();
                });
            }

            task.chain(write);
        });

        task.onSuccess(function() {
            callback(undefined, result);
        });
        task.onError(function(error) {
            callback(error);
        });
            
        task.enqueue();
    };

    /*dtwProvider.publish = function(publishAttributes, frontMatter, title, content, callback) {
        dtwHelper.uploadDtw(publishAttributes.dtwId, publishAttributes.filename, publishAttributes.isPublic, title, content, function(error, dtwId) {
            if(error) {
                callback(error);
                return;
            }
            publishAttributes.dtwId = dtwId;
            callback();
        });
    };*/

    dtwProvider.newPublishAttributes = function(event) {
        var publishAttributes = {};
        publishAttributes.dtwId = utils.getInputTextValue("#input-publish-dtw-id");
        publishAttributes.filename = utils.getInputTextValue("#input-publish-filename", event);
        publishAttributes.isPublic = utils.getInputChecked("#input-publish-dtw-public");
        if(event.isPropagationStopped()) {
            return undefined;
        }
        return publishAttributes;
    };

    /*dtwProvider.importPublic = function(importParameters, callback) {
        dtwHelper.downloadDtw(importParameters.dtwId, importParameters.filename, callback);
    };*/

    dtwProvider.createFile = function(content, post, title, folder) {
            var defaultFolder = '_drafts';
            if(!title && !content && !post) {
                folder = dtwProvider.getFolder(defaultFolder);
            }
            else if (!folder) {
              folder = dtwProvider.getFolderFromFilePath(post);
            }
            
            var newFileId = utils.id();
            if(!content) {
                console.log('setting empty content');
                content = '';
            }

            if (!post) {
                console.log('no post, defaulting to _drafts/' + newFileId + '.md');
                post = defaultFolder + '/' + newFileId + '.md';
            }

            if (!title) {
                console.log('setting title to post');
                title = post;
            }

            var syncAttributes = createSyncAttributes(post, post, content, title, null);
            var syncLocations = {};
            syncLocations[syncAttributes.syncIndex] = syncAttributes;

            var fileDesc = fileMgr.createFile(title, content, null, syncLocations); 
            if(folder) {
                folder.addFile(fileDesc);
            }
            return fileDesc;
    };

    dtwProvider.controlFileMgr = function() {
       fileMgr.UIcreateFile = dtwProvider.createFile;
    };

    dtwProvider.getFolderFromFilePath = function(post) {
       var folder;
       var endSlash = post.lastIndexOf('/');
       if(endSlash > 0) {
         var folderPath = post.substring(0, endSlash);
         folder = dtwProvider.getFolder(folderPath);
        }
       return folder;
    };

    dtwProvider.getFolder = function(folderPath) {
        var folders = documentManager.listFolders();
         var folder = folders[folderPath];
         if (!folder) {
            folder = documentManager.createFolder(folderPath);
         }
         return folder;
    };

    dtwProvider.downloadAndSave = function(post) {
        var downloadFilePath = '/system/file/' + post;
        $.ajax({
            url: downloadFilePath,
            dataType: 'text', //text so .js and xml files aren't evaluated as objects
            timeout: constants.AJAX_TIMEOUT
        })
        .fail(function(jqXHR) {
                    var error = {
                        code: jqXHR.status,
                        message: jqXHR.statusText
                    };
                    console.log('failing in download and save post:', post);
                    handleError(error, null);
                })
        .done(function( data ) {
            dtwProvider.createFile(data, post, post);
        });
    };

    function createSyncAttributes(id, etag, content, title, discussionListJSON) {
        discussionListJSON = discussionListJSON || '{}';
        var syncAttributes = {};
        syncAttributes.provider = dtwProvider;
        syncAttributes.id = id;
        syncAttributes.etag = etag;
        syncAttributes.contentCRC = utils.crc32(content);
        syncAttributes.titleCRC = utils.crc32(title);
        syncAttributes.discussionListCRC = utils.crc32(discussionListJSON);
        syncAttributes.syncIndex = createSyncIndex(etag);
        //var merge = settings.conflictMode == 'merge';
        
        if(merge === true) {
            // Need to store the whole content for merge
            syncAttributes.content = content;
            syncAttributes.title = title;
            syncAttributes.discussionList = discussionListJSON;
        }
        return syncAttributes;
    }


    function createSyncIndex(path) {
        console.log('creating sync index ', path);
        return "sync." + providerId + "." + path;
    }

    function handleError(error, task) {
        var errorMsg;
        if(error) {
            logger.error(error);
            // Try to analyze the error
            if(typeof error === "string") {
                errorMsg = error;
            }
            else {
                errorMsg = "localhost error (" + error.code + ": " + error.message + ").";
                if(error.code >= 500 && error.code < 600) {
                    // Retry as described in Google's best practices
                    return task.retry(new Error(errorMsg));
                }
                else if(error.code === 0 || error.code === -1) {
                    errorMsg = "|stopPublish";
                }
            }
        }
        if(task && task.error) {
            task.error(new Error(errorMsg));
        }
    }

    function loadCurrentFrontmatter(frontMatter){
        document.getElementById("title").value = frontMatter.title;
        document.getElementById("summary").value = frontMatter.summary;
        document.getElementById("permalink").value = frontMatter.permalink;
        document.getElementById("post").value = frontMatter.post;
        document.getElementById("coverImage").innerHTML = frontMatter.title;
        document.getElementById("image").innerHTML = frontMatter.title;
    };

    function getFrontMatter(f){
        var fm = {title:"", summary:"", permalink:"", 
                    post:"", coverImage:"", image:""};
        var startIndexer = f.indexOf("title:");
        var endIndexer = f.indexOf("summary:");

        fm.title = getFMLine(startIndexer,endIndexer,f);
        endIndexer = startIndexer;
        startIndexer = f.indexOf("permalink:");

        fm.summary = getFMLine(startIndexer,endIndexer,f);
        endIndexer = startIndexer;
        startIndexer = f.indexOf("post:");

        fm.permalink = getFMLine(startIndexer,endIndexer,f);
        endIndexer = startIndexer;
        startIndexer = f.indexOf("coverImage:");

        fm.post = getFMLine(startIndexer,endIndexer,f);
        endIndexer = startIndexer;
        startIndexer = f.indexOf("image:");

        fm.coverImage = getFMLine(startIndexer,endIndexer,f);
        endIndexer = startIndexer;
        startIndexer = f.length;

        fm.image = getFMLine(startIndexer,endIndexer,f);

        return fm;
    };

    function getFMLine(a,b,F){
         var line = F.substring(startIndexer,endIndexer);
         return line;
    };

    dtwProvider.getNewFiles = function() {
        //3 lines below activate derek's fix, still wip
        //var fm = {content: content};
        //var newFM = getFrontMatter(fm);                
        //loadCurrentFrontmatter(newFM);
        console.log('getting new file');
        var path = '/system/dir';
        //dtwFileProvider.syncNewFiles = function() {
            console.log('in sync new files');
            $.ajax({
                    url: path,
                    timeout: constants.AJAX_TIMEOUT
                })
            .fail(function(jqXHR) {
                        var error = {
                            code: jqXHR.status,
                            message: jqXHR.statusText
                        };
                        console.log('in fail get new files');
                        handleError(error, null);
                    })
            .done(function( data ) {
             parseFiles(data);
            });

        //};

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }   

        function parseFiles(data) {
            var savedFiles = [];
            for (var key in fileSystem) {
                var obj = fileSystem[key];
                savedFiles[obj.title] = true;
            }
           
           for (var i = 0; i < data.length; i++) {
                var post = data[i];
                if (endsWith(post, '.md') ||
                 endsWith(post, '.html') || 
                 endsWith(post, '.txt') ||
                 endsWith(post, '.xml') ||
                 endsWith(post, '.js') ||
                 endsWith(post, '.sass') ||
                 endsWith(post, '.scss') ||
                 endsWith(post, '.yml') ||
                 endsWith(post, '.atom')
                 ) {
                    if (savedFiles[post]!== true) {
                        dtwProvider.downloadAndSave(post);
                    }
                }
            }
            
        }

    };
    
    console.log('binding dtwProvider onready');
    eventMgr.addListener("onReady", function() {
        dtwProvider.getNewFiles();

        $(".action-refresh-files").click(function() {
            dtwProvider.getNewFiles();            
        });
    });
    
    console.log('bound dtwProvider onready');

    eventMgr.onDtwProviderCreated(dtwProvider);

    return dtwProvider;
});