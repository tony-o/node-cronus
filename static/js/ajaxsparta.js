$(document).ready(function(){
  $("#createproject").click(function(e){
    e.preventDefault();
    $.ajax({
      url:"/admin?action=createproject&name="+$("#projectform").find("#name").val()+"&json=true"
      ,success:function(data,status,xhr){
        if(data && data.projecterror){
          $("form#projectform > .error").remove();
          $("form#projectform").prepend(data.projecterror);
        }else{
          document.location.reload(true);
        }
      }
    });
  });


  $("#createtask").click(function(e){
    e.preventDefault();
    $.ajax({
      url:"/admin?action=createtask&name="+$("#taskform").find("#name").val()+"&projectname="+$("#projectname").val()+"&json=true"
      ,success:function(data,status,xhr){
        alert(data);
        if(data && data.taskerror){
          $("form#taskform > .error").remove();
          $("form#taskform").prepend(data.taskerror);
        }else{
          document.location.reload(true);
        }
      }
    });
  });
});
