var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

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
      if (file == 'node_modules' || file.indexOf(".") == 0 || file == '_site') {
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

router.post('/system/git', function (req, res, next) {
  var dtwFilePath = dtwPathRoot + subdomain +'/';
    console.log('in git');
    var command = req.body.command;
    var options = {cwd: dtwFilePath};
    var after = function(error, stdout, stderr) {
    	console.log('error', error);
    	console.log('stdout', stdout);
        console.log('stderr', stderr);
        res.send(stdout);
    }
    exec(command, options, after);

});

router.get('/system/dir', function (req, res, next) {
  var filePath = dtwPathRoot + subdomain;

  var finish = function (error, results) {
      if(error == null){
        res.send(results);
      }
      else {
        res.send(error);
      }
    }
    walk(filePath, finish);
    return;
});

router.get('/system/file/*', function (req, res, next) {
  var filePath = dtwPathRoot + subdomain;
	console.log('in get file');

	//var indexOfLastSlash = req.url. lastIndexOf('/')+1;
	var fileName = req.url.replace('/system/file', '');//substring(indexOfLastSlash);
	var getFile = filePath + fileName;
	console.log('getting file ' + getFile);
	res.sendFile(getFile);
	return;

  next();
});


module.exports = router;
