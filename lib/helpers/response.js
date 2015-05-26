var response =  function *(ctx, success, code, data){
  ctx.type   = 'json';
  ctx.status = code;
  ctx.body   = { success: success, code: code, data: data };
  return;
};

module.exports = response;