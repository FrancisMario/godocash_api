var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var dotenv = require('dotenv');
var createError = require('http-errors');

const connection = require("./db");
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');


// Unauthenticated Routes
var customerAuth = require('./controllers/customer.auth');
var vendorAuth = require('./controllers/vendor.auth');

// Authenticated Routes
var vendorInventory = require('./controllers/vendor.inventory');

// get comfig vars
dotenv.config();
process.count = 0;
var app = express();

connection()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(function (req, res, next) {
//     console.log(process.count);
//     process.count++;
//     next()
// });


var verifyFunction = function (middleware) {
  return function (req, res, next) {
    var unlessNoLoginPath = ['auth', 'api']; // paths exempted from authentication
    console.log(req.originalUrl.split("/")[1]);
    if (unlessNoLoginPath.includes(req.originalUrl.split("/")[1].trim())) {
      console.log(true);
      return next();
    } else {
      console.log(false);
      return middleware(req, res, next);
    }
  };
};


// app.use(logger('production'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var auth  = require('./middleware/auth');

// middlewares
// verifyFunction
app.use(verifyFunction(auth.authenticate));

// auth routes7
app.use('/auth/customer', customerAuth);
app.use('/auth/vendor/', vendorAuth);

// authenticated routes, everything below
app.use('/vendor/inventory', vendorInventory);


app.use('/api', indexRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler 
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
