var express = require("express");
var passport = require("passport");
var strategy = require("passport-google").Strategy;

var app = express();

passport.serializeUser(function(u,d){d(null,d);});
passport.deserializeUser(function(u,d){d(null,d);});
passport.use(new strategy({
    "returnURL":"http://localhost/auth/return"
    ,"realm":"http://localhost"
  },function(id,pro,d){
    pro.id = id;
    return d(null,pro);
}));

app.listen(80);
