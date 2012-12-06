!function ($) {

    "use strict";

    var template = _.template( '<ul class="bootstrap-select"><li class="dropdown"><i class="icon-chevron-down"></i><a class="dropdown-toggle" data-toggle="dropdown" href="#"><%= $(options).first().text() %></a><ul class="dropdown-menu"><% _.each(options, function(option){ %><li><a href="#" data-value="<%= $(option).val() %>"><%= $(option).text() %></a></li><% }); %></ul></li></ul>' );

    $.fn.bootstrapSelect = function() {
        return this.each(function () {
            var $this = $(this).hide();
            $(template({ "options": $(this).find("option") })).insertAfter( $(this) );
        });
    };

    $(document).on("click", ".bootstrap-select .dropdown-menu a", function(e){
        e && e.preventDefault();
       var $bootstrapSelect = $(this).closest(".bootstrap-select"),
           $select = $bootstrapSelect.prev("select");

        $bootstrapSelect
            .find(".dropdown-toggle")
            .text( $(this).text() );
        $select
            .find("option")
            .removeAttr("selected")
            .filter("[value=%s]".replace("%s", $(this).data("value") ))
            .attr("selected", "selected")
        $select.trigger("change");
    });

    $(document).ready(function(){
        $("[data-toggle=selects]").bootstrapSelect();
    });

}(window.jQuery);