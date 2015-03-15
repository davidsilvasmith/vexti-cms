var express = require('express');
var router = express.Router();
var fs = require('fs');

var path = '/Users/smithd98/apps/bitcoinbulls.net/';

router.post('/', function(req, res, next) {


	if(req.url.indexOf('/system/git') == 0) {
        console.log('in git');

        var command = req.body.command;
        var options = {cwd: path};
        var after = function(error, stdout, stderr) {
        	console.log('error', error);
        	console.log('stdout', stdout);
            console.log('stderr', stderr);
            res.send(stdout);
        }
        exec(command, options, after);

        return;
	}

	var file = req.body.content;
	var path = path + req.body.markdownPath;
	console.log('savepath', path);
	fs.writeFile(path, file, function(err) {
	    if(err) {
	        res.send('error!!');
	    } else {
	        res.send('success!');
	    }
	    return;
	}); 


});

module.exports = router;
