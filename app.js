var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var wxRouter = require('./routes/wx');
var warframe = require('./routes/warframe');
var initJs = require('./utils/wfaLibs');
var config = require('./config/myConfig');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/wx', wxRouter);
app.use('/wf', warframe);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//init data
if(config.localLib){
  initJs.initLocalLib();
  initJs.initLibsCache();
} else {
  initJs.initToken(function (res) {
    console.log('app.js : ','Token init success!');
    initJs.initLibs(function (res_) {
      console.log('app.js : ','Libs init success!');
      initJs.initLibsCache();
    // Object.keys(initJs.lib).forEach(function (value) {
    //   console.log(value,initJs.libs[value].keys().length);
    // })
    })
  });
}
module.exports = app;
