var basicAuth = require('basic-auth-connect');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var exec = require('child_process').exec;
var express = require('express');
var favicon = require('serve-favicon');
var fs = require('fs');
var logger = require('morgan');
var multer  = require('multer');
var path = require('path');
var sleep = require('sleep');
var serveStatic = require('serve-static')



var index = require('./routes/index');
var editor = require('../../client/app');
var save = require('./routes/savefile')
var users = require('./routes/users');

var app = express();


app.use(basicAuth(function(user, pass) {
    var isDave = (user === 'dave' && pass === 'theoAve');
    var isJesse = (user === 'jesse' && pass === 'XYJ48RaZi*xk');
    var isRupert = (user === 'rupert' && pass === 'XYJ48RaZi*xk');
    var isTodd = (user === 'todd' && pass === 'catt6969');
    var isStuart = (user === 'stuart' && pass === 'Qps4z6FZtRYDIo');

 return isDave || isJesse || isRupert || isTodd || isStuart || pass === 'proposalViewer';
}));


subdomain ='';
dtwPathRoot = '/home/derek/Users/smithd98/apps/'; //change this locally after push/pull

dtwSites = [];

fs.readdir(dtwPathRoot, function(err,files){
    if(err) throw err;
    files.forEach(function(file){
        
        if(fs.existsSync(dtwPathRoot + file + '/_config.yml')) {
            dtwSites.push(file);
        }
    });
    console.log('dtwSites', dtwSites);
 });

app.all('*', function(req, res, next) {
    var hostname = req.headers.host.split(":")[0];
    var dot = hostname.indexOf('.');
    subdomain = hostname.substring(0, dot);
    next();
});

app.use(multer({ dest: './images/',
 rename: function (fieldname, filename) {
    console.log('fieldname', fieldname);
    console.log('filename', filename);
    return filename;
  },
  changeDest: function(dest, req, res) {
      var pathFromClient = req.body.dtwImageUploader;
      console.log('pathFromClient', pathFromClient);
      var newDest = dtwPathRoot + subdomain + '/' + dest + pathFromClient + '/';
      console.log('new destination', newDest);
      if (!fs.existsSync(newDest)) {
        //fs.mkdirSync(newDest,'0777', true);
        var command = "mkdir -p '" + newDest + "'";
        
        var options = {};
        var after = function(error, stdout, stderr) {
                console.log('error', error);
                console.log('stdout', stdout);
                console.log('stderr', stderr);
        }
        exec(command, options, after);
        console.log('sleeping for 1 second');
        sleep.sleep(1);
        console.log('waking up');
      }
      //newDest = newDest + "b.png";
      return newDest;  
    },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

app.post('/system/upload',function(req,res){
  if(done==true){
    console.log(req.files);
    var imageSavedPath = req.files.userPhoto.path;
    var startExtract = imageSavedPath.indexOf(subdomain) + subdomain.length;
    var returnPath = imageSavedPath.substring(startExtract);
    res.end("File uploaded to: " + returnPath);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// doesn't work because of subdomaining
// replaces app.use('/raw-markdown', express.static(dtwPathRoot + 'bitcoinbulls/'));
app.use('/raw-markdown', function(req, res, next) {
    //var done = finalhandler(req, res);
    //console.log('req', req);
    //console.log('serve', serve);
    var serve = serveStatic(dtwPathRoot + subdomain + '/', {'index': ['index.html', 'index.htm']})
    serve(req, res, next);
});

app.use('/editor', editor);
app.use('/', index);
app.use('/savefile', save);
app.use('/users', users);

app.use('/', function(req, res, next) {
    //var done = finalhandler(req, res);
    //console.log('req', req);
    //console.log('serve', serve);
    console.log('subdomain', subdomain);
    if (subdomain) {
        var serve = serveStatic(dtwPathRoot + subdomain + '/_site/', {'index': ['index.html', 'index.htm']})
        serve(req, res, next);
    }
    else {
        res.render('index', { title: 'Death to Wordpress' });      
    }

/* GET home page. */
//router.get('/', function(req, res, next) {
  
//});

});

//the commented error handlers below produce all http statuses in the
//server, not just errors. uncommenting reactivates logging 

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });


module.exports = app;
