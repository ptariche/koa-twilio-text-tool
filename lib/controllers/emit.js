var _         = require('lodash');
var co        = require('co');
var is        = require('is_js');
var config    = require('../config/local.json');
var twilio    = require('twilio')(config.twilio.key, config.twilio.token);
var response  = require('../helpers/response');

var send = function *(next){
  try {
    var ctx           = this; 
    var body          = this.request.body; 
    var token         = ctx.get("x-access-token") ? ctx.get("x-access-token") : ctx.request.query["x-access-token"] ? ctx.request.query["x-access-token"] : false;
    var phone_numbers = body.phone_numbers.split(','); 
    var message       = body.message; 
    if(token === config.token){
      if(is.not.array(phone_numbers) ) return yield response(ctx, false, 412, 'Phone numbers must be an array');
      if (phone_numbers && body.message) {
        var sentArray = [];
        var from = config.twilio.number;
        var i = phone_numbers.length;
        while(i > -1){
          var send = yield sendMessage(from, phone_numbers[i], message)
          if (send.to !== null || send.to !== undefined) sentArray.push(send.to);
          i--; 
        }
        sentArray = _.without(sentArray, null, undefined);
        yield response(ctx, true, 200, {"phone_numbers": sentArray, messages: "sent"});
        next;
      } else {
        console.error('no valid phone nuber or message')
        yield response(ctx, false, 412, false);
        next;
      }
    } else {
      yield response(ctx, false, 401, false);
    }
  } catch(err){
    onerror(err);
    yield response(ctx, false, 412, false);
    next;
  }
};

function onerror(err) {
  console.error(err);
}

var sendMessage = function *(from, to, message){
  return yield function(cb){
    twilio.sendMessage({
      to:   '+1' + to, 
      from: '+1' + from, 
      body: message
    }, function(err, resp) {
      if (!err) { 
        cb(null, resp);
      } else {
        cb(null, false);
      }
    });
  }
}

module.exports.send = send;