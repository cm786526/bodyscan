$(function() {
    $(".nav-tabs-li").bind("click", function () {
        $(".nav-tabs-li").removeClass('active');
        $(this).addClass('active');
    })
});