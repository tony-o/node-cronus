module.exports = function(user,sock){
  var handler = require("./renderer");
  sock.on("render",function(data){
    try{
      handler[data.view](sock,user,data);
    }catch(e){
      console.error(e);
      sock.emit("error",{e:"No view found: " + data.view});
    }
  });
  sock.on("sync",function(data){
   try{
      handler.sync(sock,user,data);
    }catch(e){
      console.error(e);
      sock.emit("error",{e:"Couldn't synchronize" + data});
    }
  });
};
