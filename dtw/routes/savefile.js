var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.post('/', function(req, res, next) {
	var file = req.body.frontmatter + req.body.content;
	var path = '/Users/smithd98/apps/bitcoinbulls.net/' + req.body.markdownPath;
	fs.writeFile(path, file, function(err) {
	    if(err) {
	        res.send('error!!');
	    } else {
	        res.send('success!');
	    }
	}); 
});

module.exports = router;
