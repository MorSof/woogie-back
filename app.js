const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require("body-parser");
const indexRouter = require('./routes');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const reactionsRouter = require('./routes/reactions');
const notificationsRouter = require('./routes/notifications');
const corsMiddleware = require("./modules/cors-middleware");
const camelcaseMiddleware = require("./modules/camelcase-middleware");
const googleAuthMiddleware = require("./modules/google-auth-middleware");
const nullStringMiddleware = require("./modules/null-string-middleware");
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.all('*', corsMiddleware);
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/reactions', reactionsRouter);
app.use('/notifications', notificationsRouter);


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

app.on('listening',  () => {
  // server ready to accept connections here
});

module.exports = app;
