var fs = require("fs");
var orm = require("orm");
var jade = require("jade");
var express = require("express");
var passport = require("passport");
var strategy = require("passport-google").Strategy;

var app = express();

passport.serializeUser(function(user,done){done(null,user);});
passport.deserializeUser(function(user,done){done(null,user);});
passport.use(new strategy({
   "returnURL":"http://"+process.env.DOMAIN+"/auth/return"
   ,"realm":"http://"+process.env.DOMAIN
 },function(id,profile,d){
   profile.id = id;
   return d(null,profile);
}));

app.configure(function(){
 app.use(express.cookieParser());
 app.use(express.bodyParser());
 app.use(express.session({"secret":"a8er9a0rrr"}));
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
   res.redirect("/account");
});
var authenticated = function(req,res,n){
 if(!req.isAuthenticated()){
   res.redirect("/auth");
   return;
 }
 n();
};

app.get("/",function(req,res){
 res.redirect("/auth");
});

require("./express.conf.js")(app);

var port = process.env.PORT || 5000;
app.listen(port);

