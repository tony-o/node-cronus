var fs = require("fs");
var jade = require("jade");
var http = require("http");
var express = require("express");
var passport = require("passport");
var strategy = require("passport-google").Strategy;
var socketio = require("socket.io");

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server,{"log level":0});
var session = new express.session.MemoryStore();
var DOMAIN = process.env.DOMAIN || "10.0.0.155:5000";


passport.serializeUser(function(user,done){done(null,user);});
passport.deserializeUser(function(user,done){done(null,user);});
passport.use(new strategy({
   "returnURL":"http://"+DOMAIN+"/auth/return"
   ,"realm":"http://"+DOMAIN
 },function(id,profile,d){
   profile.id = id;
   return d(null,profile);
}));

app.configure(function(){
   app.use(express.cookieParser());
   app.use(express.bodyParser());
   app.use(express.session({"secret":process.env.APPKEY||"ramb0",store:session,key:"express.sid",cookie:{maxAge:60*60*1000}}));
   app.use(passport.initialize());
   app.use(passport.session());
   app.use(app.router);
   app.use(express.static(__dirname + "/static"));
   app.set("views",__dirname + "/views");
   app.set("view engine","jade");
});

app.get("/auth",passport.authenticate("google"));
app.get("/auth/return",passport.authenticate("google",{
      "failureRedirect":"/auth"
   }),function(req,res){
     res.redirect("/membersonly");
});

app.get("/",function(req,res){
   res.redirect("/auth");
});

require("./routes.js")(app,io,session);

var port = process.env.PORT || 5000;
server.listen(port);

