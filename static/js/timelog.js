var c = new (function(){
  this.g = function(key){
    var val = $.cookie(key);
    try{
      val = JSON.parse(val);
    }catch(e){ }
    return val;
  };

  this.s = function(key,value){
    $.cookie(key,value);
  };

  this.r = function(key){
    $.removeCookie(key);
  };
})();
var reparsetimers = function(){
  var qq = c.g("timers");
  qq = qq instanceof Array ? qq : [];
  var str = "";
  for(var q in qq){ str += JSON.stringify(qq[q]) + "<br/>"; }
  $("#opentimers").html(str);  
};

$("#timeform").submit(function(e){e.preventDefault();return false;});
$("#starttimer, #savetimer").click(function(){
  var arr = c.g("timers");
  arr = arr instanceof Array ? arr : []; 
  arr.push({title:$("#timername").val(),project:$("#projectname").val(),task:$("#taskname").val(),start:new Date(),notes:$("#timernotes").val(),id:-1,running:$(this)==$("#savetimer")?false:true});
  c.s("timers",JSON.stringify(arr));
  reparsetimers();
});
$(".container ul.nav li a").click(function(){
  var dd = ["timerhistory","opentimers","tracktime"];
  for(var d in dd){ 
    $("#" + dd[d]).hide();
    if($(this).attr("href").toString().substr(1).toLowerCase() == dd[d]){
      $("#" + dd[d]).show();
    }
  }
});
$(".container ul.nav li a").first().click();
