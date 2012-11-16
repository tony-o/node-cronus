

var socket = io.connect("http://10.0.0.155:5000");
socket.emit("render",{view:"init"});
socket.on("render",function(data){
   $("[block='" + data.name + "']").html(data.data);
});
