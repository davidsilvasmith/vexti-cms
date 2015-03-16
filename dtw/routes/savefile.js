var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/', function(req, res, next) {
	var path = dtwPathRoot + subdomain + '/';

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
