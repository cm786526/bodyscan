var today_str=getCurDate();
$(document).ready(function(){
    var w_height=$(window).height();
    $(".container").css("min-height",w_height+"px");
    $(".main-info-box").css("min-height",(w_height-183)+"px");
    var size=$(".good-list .item").size();
    var width=$(".good-list .item").eq(0).width();
    $(".good-list").css("width",(width+10)*size+"px");
}).on("click",".select_shop",function(){
    $(".pop-select-shop").removeClass("hide");
}).on("click",".select_goods_list>.item",function(){
    $(this).addClass("active").siblings(".item").removeClass("active");
});
var temp='{{each data_list as data}}' +
    '{{if data["data"]==today}}' +
    '<tr class="c333">'+
    '                    <td class="txt-al">今日</td>' +
    '{{/else}}'+
    '<tr class="c666">'+
    '                    <td class="txt-al">{{data[date]}}</td>' +
    '{{/if}}' +
    '                    <td class="txt-ar">600</td>'+
    '                    <td class="txt-ar">500</td>'+
    '                </tr>' +
    '{{/each}}';
function getData(){
    var url='';
    var args={
        action:'list'
    }
    $(".wrap-loading-box").removeClass("hide");
    $.postJson(url,args,function(res){
        $(".wrap-loading-box").addClass("hide");
        if(res.success){
            var $table=$("#data_sale");
            $table.empty();
            var datalist = res.data_list;
            $(".no_result").addClass("hide");
            if(datalist.length==0){
                $(".no_result").removeClass("hide");
            }else{
                res.today=today_str;
                var render = template.compile(temp);
                var html = render(res);
                $table.append(html);
            }
        }else{
            return Tip(res.error_text);
        }
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(ERROR_TXT);
    },function(){
        $(".wrap-loading-box").addClass("hide");
        Tip(TIMEOUT_TXT);
    });
}
function getCurDate(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month = month<10?("0"+month):month;
    var day = date.getDate();
    day = day<10?("0"+day):day;
    var cur_time = year+"-"+month+"-"+day;
    return cur_time;
}