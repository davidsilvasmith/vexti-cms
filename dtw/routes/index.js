var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('*', function (req, res, next) {
	console.log('hostname:' + req.hostname);

	if(req.hostname == 'bitcoinbulls.localhost' ) {

		var path = '/var/folders/6r/v8g4r3m56m19cq7ljw8x3v_c0000gp/T/jekyll/' + req.url;
		console.log('path:' + path);
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
  res.render('index', { title: 'Express' });
});

router.get('/preview/', function (req, res, next) {
	var path = '/var/folders/6r/v8g4r3m56m19cq7ljw8x3v_c0000gp/T/jekyll/index.html';
	if (fs.existsSync(path)) {
  		res.sendFile(path);
  	}
  	else if (fs.existsSync(path) + index.html) {
  		console.log('checking root: ' + path+index.html);
  		res.sendFile(path+index.html);
  	}
});

module.exports = router;
