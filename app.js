var orm = require("orm");
var jade = require("jade");
var express = require("express");
var passport = require("passport");
var strategy = require("passport-google").Strategy;

var app = express();
var db = orm.connect("mysql://"+process.env.DBUSER+":"+process.env.DBPASS+"@"+process.env.DBHOSTDB,function(success,db){
  if(!success){
    console.error("Could not connect to db");
    return;
  }
  console.log("Creating models");
  /* DEFINE DB MODELS */
  var projectitem = db.define("project",{
    "name":{"type":"string"}
    ,"archived":{"type":"bool"}
  });
  var taskitem = db.define("task",{
    "name":{"type":"string"}
    ,"archived":{"type":"string"}
  });
  var timeitem = db.define("time",{
    "author":{"type":"string"}
    ,"starttime":{"type":"date"}
    ,"duration":{"type":"float"}
  });
  taskitem.hasOne("project",projectitem);
  timeitem.hasOne("project",projectitem);
  timeitem.hasOne("task",taskitem);
  projectitem.sync();
  taskitem.sync();
  timeitem.sync();

  passport.serializeUser(function(user,done){done(null,user);});
  passport.deserializeUser(function(user,done){done(null,user);});
  passport.use(new strategy({
      "returnURL":"http://timekeeping.odellam.com/auth/return"
      ,"realm":"http://timekeeping.odellam.com"
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
  app.get("/account",authenticated,function(req,res){
    res.render("account",{locals:{
      title:"Account Info"
      ,user:req.user
    }});
  });
  app.get("/logtime",authenticated,function(req,res){
    res.render("logtime",{locals:{
      title:"Log Time"
      ,user:req.user
    }});
  });
  app.get("/admin",authenticated,function(req,res){
    var item;
    var server = function(e,i){
      console.log("e:",e,"\ni:",i);
      projectitem.find({},function(projects){
        console.log("projects:",projects);
        taskitem.find({},function(items){
          res.render("admin",{locals:{
            title:"Admin"
            ,user:req.user
            ,projects:projects
            ,items:items
          }});
        });
      });
    };
    
    switch(req.query["action"]){
      case "createproject":
        console.log("creating project:",req.query["name"]);
        item = new projectitem({"name":req.query["name"]});
        item.save(server);
        break;
      case "createtask":
        server(null,null);
        break;
      default:
        server(null,null);
    };
    
  });
  var port = process.env.PORT || 5000;
  app.listen(port);

});
