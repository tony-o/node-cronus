var fs = require("fs");
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
  var projectnamevalidation = function(val,n){return !val||val.length<3?n("too-short"):n();};
  var projectitem = db.define("project",{
    "name":{"type":"string","validations":[orm.validators.unique(),projectnamevalidation]}
    ,"archived":{"type":"int"}
  });
  var taskitem = db.define("task",{
    "name":{"type":"string"}
    ,"archived":{"type":"int"}
  });
  var timeitem = db.define("time",{
    "author":{"type":"string"}
    ,"starttime":{"type":"date"}
    ,"duration":{"type":"float"}
    ,"status":{"type":"string"}
    ,"running":{"type":"int"}
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
  app.get("/account",authenticated,function(req,res){
    res.render("account",{locals:{
      title:"Account Info"
      ,user:req.user
    }});
  });
  app.post("/synctimer",authenticated,function(req,res){
    console.log("SNACKS",JSON.stringify(req.body));
    var scb = function(e,newitem){
      console.log("SAVING",JSON.stringify(newitem));
      if(e != null){
        res.json({e:e,data:req.body});
      }else{
        res.json({id:newitem.id});
      }
    };
    if(req.body.id == -1){
      var item = new timeitem({
        project_id:req.body.project
        ,task_id:req.body.task
        ,author:JSON.stringify(req.user)
        ,starttime:new Date(req.body.start)
        ,duration:parseFloat(req.body.duration) || -1
      });
      item.save(scb);
    }else{
      timeitem.find({id:req.body.id,status:"open"},function(item){
        if(!item){
          console.error("not found item:",req.body.id);
          scb("not-found",null);
          return;
        }
        item.project_id = req.body.project;
        item.task_id = req.body.task;
        item.author = JSON.stringify(req.user);
        item.starttime = new Date(req.body.start);
        item.duration = parseFloat(req.body.duration) || -1;
        item.running = req.body.running == true ? 1 : 0;
        item.save(scb);
      });
    }
  });
  app.get("/logtime",authenticated,function(req,res){
    projectitem.find(function(projects){
      taskitem.find(function(tasks){
        res.render("logtime",{locals:{
          title:"Log Time"
          ,user:req.user
          ,projects:projects
          ,tasks:tasks
          ,scripts:["/js/jquery.cookie.js","/js/timelog.js"]
        }});
      });
    });
  });
  app.get("/admin",authenticated,function(req,res){
    var item;
    var server = function(e,i){
      
      projectitem.find(function(projects){
        console.log("projects:",projects);
        taskitem.find(function(tasks){
          projects && projects.length && projects.sort(function(a,b){return a.name > b.name;});
          tasks && tasks.length && tasks.sort(function(a,b){return a.project > b.project;});
          if(req.query["json"]){
            res.json({
              projecterror:jade.compile(fs.readFileSync(__dirname + "/views/i/errorbox.jade"),{})({locals:(req.query["action"]=="createproject"&&e?{error:e}:null)})
              ,taskerror:jade.compile(fs.readFileSync(__dirname + "/views/i/errorbox.jade"),{})({locals:(req.query["action"]=="createtask"&&e?{error:e}:null)})
            });
            return;
          }
          res.render("admin",{locals:{
            title:"Admin"
            ,user:req.user
            ,scripts:["/js/ajaxsparta.js"]
            ,projects:projects
            ,tasks:tasks
            ,projecterror:(req.query["action"]=="createproject"&&e?e:null)
            ,taskerror:(req.query["action"]=="createtask"&&e?e:null)
          }});
        });
      });
    };
    
    switch(req.query["action"]){
      case "createproject":
        item = new projectitem({"name":req.query["name"]});
        item.save(server);
        break;
      case "archiveproject": case "reviveproject":
        projectitem.find({"name":req.query["name"]},function(p){
          if(p == null){
            server({"value":req.query["name"],"msg":"not-found"},null);
            return;
          }
          p[0].archived = (req.query["action"]=="archiveproject"?1:0);
          p[0].save(server);
        });
        break;
      case "createtask":
        taskitem.find({"name":req.query["name"],"project_id":req.query["projectname"]},function(i){
          if(i == null){
            item = new taskitem({"name":req.query["name"],"project_id":req.query["projectname"]});
            item.save(server);
            return;
          }
          server({"value":req.query["name"],"msg":"project -> task name: not-unique"},null);
        });
        break;
      case "archivetask": case "revivetask":
        taskitem.find({"id":req.query["name"]},function(p){
          if(p==null){
            server({"value":req.query["name"],"msg":"not-found"},null);
            return;
          }
          p[0].archived = (req.query["action"]=="archivetask"?1:0);
          p[0].save(server);
        });
        break;
      default:
        server(null,null);
    };
    
  });
  var port = process.env.PORT || 5000;
  app.listen(port);

});
