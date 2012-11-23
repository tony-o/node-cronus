var socket = io.connect("http://" + document.location.hostname);
var sock = {hooks:{},data:{date:new Date()}};
socket.on("render",function(data){
  $("[block='" + data.name + "']").html(data.data);
  $("[block='" + data.name + "']").find("[block]").each(function(){
    socket.emit("render",{view:$(this).attr("block"),data:sock.data});
  });
  for(var f in sock.hooks[data.name]){
    try{
      sock.hooks[data.name][f](data);
    }catch(e){ }
  }
});
socket.on("error",function(e){
  try{
    console.error("error: %s",JSON.stringify(e));
  }catch(e){ }
});
/* SOCK EVENT HOOKS */
sock.hooks.dateheader = [];
sock.hooks.dateheader.push(function(data){
  sock.data.date = new Date(data.date);
  $("[block='timeentry'] table th").removeClass("active");
  $("[block='timeentry'] table th:nth-child(" + (sock.data.date.getDay()+1) + ")").addClass("active");
});
sock.hooks.timeentry = [];
sock.hooks.timeentry.push(function(data){
  socket.emit("render",{view:"timeview",date:sock.data.date});
});
sock.hooks.projectoptions = [];
sock.hooks.projectoptions.push(function(data){
  socket.emit("render",{view:"taskoptions",project:$("[block='projectoptions'] option:selected").first().val()}); 
});

/* DATE PREV/NEXT FUNCTIONALITY */
$(".dateleft,.dateright").live("click",function(){
  sock.data.date.setDate(sock.data.date.getDate()+($(this)[0] == $(".dateleft")[0]?-1:1));
  socket.emit("render",{view:"dateheader",date:sock.data.date});
  socket.emit("render",{view:"timeview",date:sock.data.date});
});
$(".jumptotoday").live("click",function(){
  sock.data.date = new Date();
  socket.emit("render",{view:"dateheader",date:sock.data.date});
  socket.emit("render",{view:"timeview",date:sock.data.date});
});

/* SAVE/START TIME FUNCTIONALITY */
$("#TEsave,#TEstart").live("click",function(){
  var input = {};
  input.running = $("#TEstart")[0] == $(this)[0];
  $("div.TEnewtimer").find("input,select,textarea").each(function(){
    input[$(this).attr("id").substring(2)] = $(this).val() || $(this).text();
  });
  input.date = new Date();
  socket.emit("sync",{type:"add",data:input});
});

/* TOGGLE EXISTING TIMER */
$("button.toggletimer").live("click",function(){
  var action = $(this).attr("_running") ? "stop" : "start";
  console.log(action+":"+$(this).attr("_id"));
  socket.emit("sync",{type:action,id:$(this).attr("_id")});
});

/* REFRESH TIMER STUFF */
setInterval(function(){ socket.emit("render",{view:"timeview",date:sock.data.date}); }, 20000);

socket.emit("render",{view:"init"});
