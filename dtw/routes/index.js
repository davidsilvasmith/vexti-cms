var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var walk = function(dir, done) {
	walkInternal(dir, dir, done);
};

var walkInternal = function(dir, originalDir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      if (file == 'node_modules' || file.indexOf(".") == 0) {
        console.log('not including:', file);
        if (!--pending) done(null, results);
        return;
      }
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkInternal(file, originalDir, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file.replace(originalDir, ''));
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

router.get('*', function (req, res, next) {
	console.log('hostname:' + req.hostname);

	if(req.hostname == 'bitcoinbulls.localhost' ) {


		var websitePath = '/var/folders/6r/v8g4r3m56m19cq7ljw8x3v_c0000gp/T/jekyll/';
		var path= websitePath + req.url;

		var filePath = '/Users/smithd98/apps/bitcoinbulls.net/';
		console.log('path:' + path);

		if (req.url.indexOf('/system/dir') == 0){
			var finish = function (error, results) {
				if(error == null){
					res.send(results);
				}
				else {
					res.send(error);
				}
			}
			walk(filePath, finish);
			//var files = fs.readdirSync(filePath);
			//res.send(files);
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
