// Author: Peter A. Tariche

//Module Libraries 
var koa       = require('koa');
var parser    = require('koa-bodyparser');
var lusca     = require('koa-lusca');
var compress  = require('koa-compress');
var router    = require('koa-router')();
var validator = require('koa-validator');

//Config
var config    = require('./config/local.json');
var port      = process.env.PORT     || 80;

// Init App
var app      = koa();
app.name     = config.appname;
app.env      = process.env.NODE_ENV || 'development';
app.keys     = config.keys;

// The Usual Suspects
app.use(compress())
app.use(parser({ onerror: function (err, ctx) { ctx.bodyParserError = err; }}));
app.use(function *(next) {
  if (this.bodyParserError) {
    console.error(this.bodyParserError);
  } else {
    yield next;
  }
});

app.use(validator({
  onValidationError: function(err){
    console.log(err);
  }
}));

app.use(lusca({
  csrf: false,
  csp: { /* ... */},
  xframe: 'SAMEORIGIN',
  p3p: config.p3p,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  xssProtection: false
}));
//End of Usual Suspects

//Router
var emitController = require('./controllers/emit.js');

router.post('/', emitController.send);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port);
console.log('listening on port '+ port);
