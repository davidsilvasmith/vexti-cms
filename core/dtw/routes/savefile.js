var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var router = express.Router();


router.post('/', function(req, res, next) {
	var path = dtwPathRoot + subdomain + '/';

	var file = req.body.content;
	var path = path + req.body.markdownPath;
	console.log('savepath', path);
	fs.writeFile(path, file, function(err) {
	    if(err) {
	        res.send('error!!');
	    } else {

	    var dtwFilePath = dtwPathRoot + subdomain +'/';
	    var command = "jekyll build"
        var options = {cwd: dtwFilePath};
	    var after = function(error, stdout, stderr) {
		    	console.log('error', error);
    			console.log('stdout', stdout);
        		console.log('stderr', stderr);
        		res.send(stdout +"\nsuccess");
    	}
    	exec(command, options, after);
	    }
	    return;
	}); 

});

module.exports = router;
