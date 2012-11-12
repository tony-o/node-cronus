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
var editing = 0;
var reparsetimers = function(){
  if(editing){return;}
  editing = 1;
  var qq = c.g("timers");
  qq = qq instanceof Array ? qq : [];
  qq.sort(function(a,b){
    return new Date(a.timedate) < new Date(b.timedate);
  });
  var gg = JSON.parse(JSON.stringify(qq));
  var str = "";
  $("#opentimers #timerlist > div:not(:first-child)").remove();
  var template = $("#opentimers #timerlist > div").first();
  var lastdt = "";
  for(var q in qq){
    (function(q,qq){ 
      var buffer = $(template).clone();
      if(qq[q].timedate.toString().substr(0,qq[q].timedate.toString().indexOf("T")) != lastdt){
        lastdt = qq[q].timedate.toString().substr(0,qq[q].timedate.toString().indexOf("T"));
        $(buffer).find(".timedate").text(lastdt);
      }else{
        $(buffer).find(".timedate").hide();
      }
      $(buffer).find(".name").text(qq[q].title);
      $(buffer).find(".project").text(qq[q].projname);
      $(buffer).find(".task").text(qq[q].taskname);
      var dd214 = parseFloat(qq[q].duration) || 0;
      if(qq[q].running){
        dd214 += Math.floor(Math.abs(new Date() - new Date(qq[q].start))/1000/60)/60;
      }
      //qq[q].duration = dd214;
      dd214 = Math.round(dd214*1000)/1000;
      dd214 = dd214 + (dd214.toString().indexOf(".") == -1 ? ".000" : Array(3 - dd214.toString().substr(dd214.toString().indexOf(".")+1).length).join("0"));
      $(buffer).find(".time").text(dd214);
      $(buffer).find(".toggletimer").text(qq[q].running?"Stop Timer":"Start Timer");
      $(buffer).find(".index").text(q);
      $(buffer).removeClass("hidden");
      $(buffer).find(".time,.name,.project,.task").dblclick(function(){
        editing = 1;
        var self = $(this);
        var par = $(self).parent();
        var val = $(par).find(".time").text();
        $(par).find(".time").text("");
        $(par).find(".time").append($("<input type=\"text\" class=\"input-mini\" value=\""+val+"\" id=\"editingtimetime\" />"));
        val = $(par).find(".name").text();
        $(par).find(".name").text("");
        $(par).find(".name").append($("<textarea class=\"input-small\" id=\"editingtimename\">"+val+"</textarea>"));
        val = gg[q].project;
        $(par).find(".project").text("");
        $(par).find(".project").append($("#projectname").clone());
        $(par).find(".project").find("#projectname").attr("id","editingtimeproject").attr("tasktarget","#editingtimetask").find("option").removeAttr("selected");
        val = gg[q].task;
        $(par).find(".task").text("");
        $(par).find(".task").append($("#taskname").clone());
        $(par).find(".task").find("#taskname").attr("id","editingtimetask").find("option").removeAttr("selected");
        $(par).find(".project").find("#editingtimeproject").find("option[value='" + gg[q].project + "']").attr("selected","selected");
        $(par).find(".project").find("#editingtimeproject").change();
        $(par).find(".task").find("#editingtimetask").find("option[value='" + val + "']").attr("selected","selected");
        
        $(par).find(".span4").text("").append($("<button class=\"btn btn-mini btn-primary\" id=\"saveedit\">Save</button>")).append($("<span/>"));
        $(par).find(".span4").append($("<button class=\"btn btn-mini btn-primary\" id=\"canceledit\">Cancel</button>"));

        $(par).find("#saveedit,#canceledit").click(function(){
          if($(this)[0] == $("#canceledit")[0]){
            editing = 0;
            reparsetimers();
            return;
          }
          var newval = parseFloat($(par).find("#editingtimetime").val()) || val;
          gg[q].duration = newval;
          gg[q].start = (new Date()).toString();
          gg[q].title = $(par).find("#editingtimename").val();
          gg[q].project = $(par).find("#editingtimeproject").val();
          gg[q].projname = $(par).find("#editingtimeproject").find("option:selected").text();
          gg[q].task = $(par).find("#editingtimetask").val();
          gg[q].taskname = $(par).find("#editingtimetask").find("option:selected").text();

          c.s("timers",JSON.stringify(gg));
          editing = 0;
          reparsetimers();
        });
      });
      $(buffer).find(".deletetimer").click(function(){
        gg.splice(q,1);
        c.s("timers",JSON.stringify(gg));
        reparsetimers();
      });
      $(buffer).find(".toggletimer").click(function(){
        var dd214 = parseFloat(qq[q].duration) || 0;
        if(qq[q].running){
          dd214 += Math.floor(Math.abs(new Date() - new Date(qq[q].start))/1000/60)/60;
        }
        gg[q].start = (new Date()).toString();
        gg[q].running = !gg[q].running;
        gg[q].duration = dd214;
        c.s("timers",JSON.stringify(gg));
        reparsetimers();
      });
      var sync = function(remove){
        remove = remove ? true : false;
        $.ajax({
          url:"/synctimer"
          ,type:"POST"
          ,contentType:"application/json; charset=utf-8"
          ,data:JSON.stringify(gg[q])
          ,success:function(data,status,xhr){
            if(remove){
              gg.splice(q,1);
            }else{
              gg[q].id = (data.id) ? data.id : -1;
            }
            c.s("timers",JSON.stringify(gg));
          }
        });
      };
      $(buffer).find(".submittime").click(function(){
        gg[q].status = "submitted";
        gg[q].running = 0;
        var dd214 = parseFloat(qq[q].duration) || 0;
        if(qq[q].running){
          dd214 += Math.floor(Math.abs(new Date() - new Date(qq[q].start))/1000/60)/60;
        }
        gg[q].duration = dd214;
        sync(true);
      });
      sync();
      $("#opentimers #timerlist").append(buffer);
    })(q,qq);
  }
  editing = 0;
};
$("#timeform").submit(function(e){e.preventDefault();return false;});
$("#starttimer, #savetime").click(function(){
  var arr = c.g("timers");
  arr = arr instanceof Array ? arr : []; 
  arr.push({title:$("#timername").val(),duration:$("#timertime").val(),projname:$("#projectname option:selected").text(),taskname:$("#taskname option:selected").text(),project:$("#projectname").val(),task:$("#taskname").val(),timedate:new Date($("#timedate").val()),start:new Date(),notes:$("#timernotes").val(),id:-1,running:$(this)[0]==$("#savetime")[0]?false:true,"status":"open"});
  c.s("timers",JSON.stringify(arr));
  reparsetimers();
  $("#timername").val("");
  $("#projectname").val("");
  $("#taskname").val("");
  $("#timernotes").val("");
  $("#timertime").val("0.00");
  $(".container ul.nav li a[href='#opentimers']").click();
});
$(".projectdropdown").live("change",function(){
  var tasktarget = $(this).attr("tasktarget");
  $(tasktarget + " option").remove();
  var id = $(this).val();
  $("#tasktoproject > peterpan").each(function(){
    if($(this).find(".projectid").text() == id){
      $(tasktarget).append($("<option value=\"" + $(this).find(".taskid").text() + "\">" + $(this).find(".taskname").text() + "</option>"));
    }
  });
});
$(".container ul.nav li a").click(function(){
  var dd = ["opentimers","tracktime"];
  $(this).parent().parent().find("li").removeClass("active");
  $(this).parent().addClass("active");
  for(var d in dd){ 
    $("#" + dd[d]).hide();
    if($(this).attr("href").toString().substr(1).toLowerCase() == dd[d]){
      $("#" + dd[d]).show();
    }
  }
});
$("body > div.container ul.nav li a").first().click();

setInterval(function(){
  reparsetimers();
},60000);

setInterval(function(){
  var qq = c.g("timers");
  qq = qq instanceof Array ? qq : [];
  var template = $("#opentimers #timerlist > div:gt(0)").each(function(){
    try{
      var index = parseInt($(this).find(".index").text());
      if(!qq[index] || !qq[index].running){ return; }
      var dd214 = parseFloat(qq[index].duration) || 0;
      dd214 += Math.floor(Math.abs(new Date() - new Date(qq[index].start))/1000/60)/60;
      $(this).find(".time").text(Math.round(dd214*1000)/1000);
    }catch(e){ }
  });
},10000);
reparsetimers();
$("#timedate")[0].type !== "date" && $("#timedate").datepicker({showOptions:{direction:"down"}});
