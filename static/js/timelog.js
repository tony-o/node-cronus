var c = function(){ return new (function(){
  this.g = function(key){
    return $.cookie(key);
  };

  this.s = function(key,value){
    $.cookie(key,value);
  };

  this.r = function(key){
    $.removeCookie(key);
  };
})(); };

$("#timeform").submit(function(e){e.preventDefault();return false;});

$("#starttimer").click(function(){
  c.s("timers",JSON.parse(c.g("timers")).push({title:$("#timername").val(),start:new Date()}));
  alert(c.g("timers"));
});
