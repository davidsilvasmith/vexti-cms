var basicAuth = require('basic-auth-connect');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var fs = require('fs');
var logger = require('morgan');
var multer  = require('multer');
var path = require('path');
var serveStatic = require('serve-static')


var index = require('./routes/index');
var editor = require('../../stackedit/app');
var save = require('./routes/savefile')
var users = require('./routes/users');

var app = express();


app.use(basicAuth(function(user, pass) {
    var isDave = (user === 'dave' && pass === 'theoAve');
    var isJesse = (user === 'jesse' && pass === 'XYJ48RaZi*xk');
    var isRupert = (user === 'rupert' && pass === 'XYJ48RaZi*xk');

 return isDave || isJesse || isRupert;
}));


subdomain ='';
dtwPathRoot = '/Users/smithd98/apps/';

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
      var newDest = dtwPathRoot + subdomain + '/' + dest;
      console.log('new destination', newDest);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
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
    res.end("File uploaded.");
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
