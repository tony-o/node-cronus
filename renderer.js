var mongoose = require("mongoose");
var fs = require("fs");
var jade = require("jade");
var environment = process.env.ENVIRONMENT || require("./config").environment;
var db = mongoose.createConnection("alex.mongohq.com","node-cronus",10009,{user:require("./config").user,pass:require("./config").pass,server:{auto_reconnect:true}});
var pmodels = require("./models");
var schemas = {};
var models = {};
for(var m in pmodels){
  schemas[m] = mongoose.Schema(pmodels[m]);
  models[m] = db.model(m,schemas[m]);
}
var cache = {fs:{},compiled:{}};
module.exports = {
  "read":function(path){
    if(!cache.fs[path] || environment == "development"){
      cache.fs[path] = fs.readFileSync(__dirname + "/views/p/" + path);
    }
    if(!cache.compiled[path] || environment == "development"){
      cache.compiled[path] = jade.compile(cache.fs[path],{filename:__dirname + "/views/p/" + path});
    }
    return cache.compiled[path];
  }
  ,"init":function(sock,user,data){
    this.header(sock,user,data);
    this.timeentry(sock,user,data);
    this.dateheader(sock,user,data);
  }
  ,"header":function(sock,user,data){
    sock.emit("render",{name:"header",data:this.read("header.jade")({locals:{user:user}})});
  }
  ,"timeentry":function(sock,user,data){
    var self = this;
    sock.emit("render",{name:"timeentry",data:self.read("timeentry.jade")({locals:{}})});
    if(data.date){
      self.timeview(sock,user,data);
    }
  }
  ,"projectoptions":function(sock,user,data){
    var self = this;
    models.project.find({archived:0},function(e,projects){
      projects.sort(function(a,b){return a.name > b.name;});
      sock.emit("render",{name:"projectoptions",data:self.read("projectoptions.jade")({locals:{projects:projects}})});
    });
  }
  ,"taskoptions":function(sock,user,data){
    var self = this;
    models.task.find({project:data.project,archived:0},function(e,tasks){
      tasks.sort(function(a,b){return a.name > b.name;});
      sock.emit("render",{name:"taskoptions",data:self.read("taskoptions.jade")({locals:{tasks:tasks}})});
    });
  }
  ,"timeview":function(sock,user,data){
    var self = this;
    var date = data.date || new Date();
    date = new Date(date);
    models.time.find({author:user.emails[0].value,date:date.setHours(0,0,0,0)},function(e,d){
      models.project.find({},function(e2,d2){
        models.task.find({},function(e3,d3){
          var projects = {}, tasks = {};
          for(var i in d2){ projects[d2[i]._id] = {name:d2[i].name,customer:d2[i].customer}; }
          for(var i in d3){ tasks[d3[i]._id] = d3[i].name; }
          for(var i in d){ 
            d[i].time += (d[i].running) ? self.__timebetween(d[i].started,new Date()) : 0;
          }
          sock.emit("render",{name:"timeview",data:self.read("timeview.jade")({locals:{times:d,projects:projects,tasks:tasks}})});
        });
      });
    });
  }
  ,"dateheader":function(sock,user,data){
    var dt = data.date || new Date();
    data.date = dt;
    sock.emit("render",{name:"dateheader",date:data.date,data:this.read("dateheader.jade")({locals:{date:data.date}})});
  }
  ,"__timebetween":function(d1,d2){
    return Math.abs(d2 - d1) / (1000*60*60);
  }
  ,"sync":function(sock,user,data){
    var self = this;
    var tobject;
    switch(data.type){
      case "add":
        tobject = new models.time(data.data);
        tobject.author = user.emails[0].value;
        tobject.date.setHours(0,0,0,0);
        tobject.save();
        self.timeview(sock,user,data);
        break;
      case "start":
        models.time.findById(data.id,function(e,d){
          var now = new Date();
          var newdur = "";
          if(d.running){
            d.time += self.__timebetween(now,d.started);            
          }
          d.running = true;
          d.started = now;
          d.save();
          self.timeview(sock,user,data);
        });
        break;
      case "stop":
        models.time.findById(data.id,function(e,d){
          console.log(d);
          var now = new Date(); 
          if(d.running){
            d.time += self.__timebetween(now,d.started);            
          }
          d.running = false;
          d.started = null;
          d.save();
          self.timeview(sock,user,data);
        });
        break;
    };
  }
};
