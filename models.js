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
                ,"date":{"type":"date"}
                    ,"starttime":{"type":"date"}
                        ,"duration":{"type":"float"}
                            ,"status":{"type":"string"}
                                ,"running":{"type":"int"}
                                  });

