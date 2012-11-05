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
});
