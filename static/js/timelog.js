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
  var gg = JSON.parse(JSON.stringify(qq));
  var str = "";
  $("#opentimers #timerlist > div:not(:first-child)").remove();
  var template = $("#opentimers #timerlist > div").first();
  for(var q in qq){
    (function(q,qq){ 
      var buffer = $(template).clone();
      $(buffer).find(".name").text(qq[q].title);
      $(buffer).find(".project").text(qq[q].projname);
      $(buffer).find(".task").text(qq[q].taskname);
      var dd214 = parseFloat(qq[q].duration) || 0;
      if(qq[q].running){
        dd214 += Math.floor(Math.abs(new Date() - new Date(qq[q].start))/1000/60)/60;
      }
      qq[q].duration = dd214;
      $(buffer).find(".time").text(Math.round(dd214*1000)/1000);
      $(buffer).find(".toggletimer").text(qq[q].running?"Stop Timer":"Start Timer");
      $(buffer).find(".index").text(q);
      $(buffer).removeClass("hidden");
      $(buffer).find(".deletetimer").click(function(){
        qq.splice(q,1);
        c.s("timers",JSON.stringify(qq));
        reparsetimers();
      });
      $(buffer).find(".toggletimer").click(function(){
        qq[q].running = !qq[q].running;
        reparsetimers();
      });
      $.ajax({
        url:"/synctimer"
        ,type:"POST"
        ,contentType:"application/json; charset=utf-8"
        ,data:JSON.stringify(qq[q])
        ,success:function(data,status,xhr){
          gg[q].id = (data.id) ? data.id : -1;
          c.s("timers",JSON.stringify(gg));
        }
      });
      $("#opentimers #timerlist").append(buffer);
    })(q,qq);
  }
};
$("#timeform").submit(function(e){e.preventDefault();return false;});
$("#starttimer, #savetimer").click(function(){
  var arr = c.g("timers");
  arr = arr instanceof Array ? arr : []; 
  arr.push({title:$("#timername").val(),duration:$("#timertime").val(),projname:$("#projectname option:selected").text(),taskname:$("#taskname option:selected").text(),project:$("#projectname").val(),task:$("#taskname").val(),start:new Date(),notes:$("#timernotes").val(),id:-1,running:$(this)==$("#savetimer")?false:true,status:"open"});
  c.s("timers",JSON.stringify(arr));
  reparsetimers();
  $("#timername").val("");
  $("#projectname").val("");
  $("#taskname").val("");
  $("#timernotes").val("");
  $("#timertime").val("0.00");
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

setInterval(function(){
  reparsetimers();
},60000);
reparsetimers();
