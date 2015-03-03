var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('*', function (req, res, next) {
	console.log('hostname:' + req.hostname);

	if(req.hostname == 'bitcoinbulls.localhost' ) {


		var websitePath = '/var/folders/6r/v8g4r3m56m19cq7ljw8x3v_c0000gp/T/jekyll/';
		var path= websitePath + req.url;

		var filePath = '/Users/smithd98/apps/bitcoinbulls.net/_posts/';
		console.log('path:' + path);

		if (req.url.indexOf('/system/dir') == 0){
			var files = fs.readdirSync(filePath);
			res.send(files);
			return;
		}
		if (req.url.indexOf('/system/file') == 0) {
			console.log('in get file');

			var indexOfLastSlash = req.url.lastIndexOf('/')+1;
			var fileName = req.url.substring(indexOfLastSlash);
			var getFile = filePath + fileName;
			console.log('getting file ' + getFile);
			res.sendFile(getFile);
			return;
		}

		if (fs.existsSync(path)) {
	  		res.sendFile(path);
  		}
  		else if (fs.existsSync(path) + index.html) {
  			console.log('checking root: ' + path+index.html);
  			res.sendFile(path+index.html);
  		}
	} else {
		next();
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Death to Wordpress' });
});

module.exports = router;
