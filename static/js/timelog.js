var c = new (function(){
  this.g = function(key){
    return $.cookie(key);
  };

  this.s = function(key,value){
    $.cookie(key,value);
  };

  this.r = function(key){
    $.removeCookie(key);
  };
})();

$("#timeform").submit(function(e){e.preventDefault();return false;});

$("#starttimer").click(function(){
  var arr = [];
  try{
    arr = JSON.parse(c.g("timers"));
  }catch(e){ }
  if(!(arr instanceof Array)){ arr = []; }
  arr.push({title:$("#timername").val(),project:$("#projectname").val(),task:$("#taskname").val(),start:new Date()});
  c.s("timers",JSON.stringify(arr));
  alert(c.g("timers"));
});
