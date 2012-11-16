var mongoose = require("mongoose");
var fs = require("fs");
var jade = require("jade");

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
      if(!cache.fs[path]){
         cache.fs[path] = fs.readFileSync(__dirname + "/views/p/" + path);
      }
      if(!cache.compiled[path]){
         cache.compiled[path] = jade.compile(cache.fs[path],{});
      }
      return cache.compiled[path];
   }
   ,"init":function(sock,user,data){
      this.header(sock,user,data);
      this.timeentry(sock,user,data);
      this.mytime(sock,user,data);
   }
   ,"header":function(sock,user,data){
      sock.emit("render",{name:"header",data:this.read("header.jade")({locals:{user:user}})});
   }
   ,"timeentry":function(sock,user,data){
      var self = this;
      models.project.find({archived:0},function(e,projects){
         sock.emit("render",{name:"timeentry",data:self.read("timeentry.jade")({locals:{projects:projects}})});
      });
   }
   ,"mytime":function(sock,user,data){
      models.time.find({},function(e,d){
         if(e){
            console.error(e);
            console.warn(d);
            throw e;
         }
      }); 
   }
};
