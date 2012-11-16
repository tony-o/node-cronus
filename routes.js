var connect = require("connect");
var cookie = require("express/node_modules/cookie");
var jade = require("jade");

module.exports = function(app,io,session){
   var authenticated = function(req,res,n){
    if(!req.isAuthenticated()){
      res.redirect("/auth");
      return;
    }
    n();
   };
   
   var usercache = {};

   app.get("/membersonly",authenticated,function(req,res){
      res.render("account",{locals:{
         user:req.user
      }});
   });

   io.configure(function(){
      io.set("authorization",function(data,cb){
         if(data.headers.cookie != null){
            data.cookie = cookie.parse(data.headers.cookie);
            data.sessionID = connect.utils.parseSignedCookie(data.cookie["express.sid"],process.env.APPKEY||"ramb0");
            session.get(data.sessionID, function(e,s){
               if(e || !s){
                  console.error("auth error sio - session find");
                  return cb("auth error sio - session find",false);
               }
               data.session = s.passport.user;
               return cb(null,true);
            });
            return;
         }
         console.error("auth error sio");
         cb("auth error sio",false);
      });
   });

   io.sockets.on("connection",function(sock){
      var user = sock.handshake.session;
      //do shit
      require("./socks")(user,sock);
 
   });
};
