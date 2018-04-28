//开票助手切换打印机
var printer_source = "" ; //设置打印机的场景
$(document).ready(function(){
    printer_source = $(".pop-change").attr("data-source");
}).on("click",".change_plist>li",function(){
    var $this = $(this);
    $(".change_plist>li").removeClass("active");
    $this.addClass("active");
    if($this.attr("data-id")=="-1"){
        initPosPrint("set");
    }else{
        initPosPrint("del");
    }
}).on("click",".finish_change_btn",function(){
    changePrinter($(this));
});
var print_item = '{{each printer_list as print}}'+
                    '<li class="{{if print.current_user_bind==1}}active{{/if}} print_{{print.id}}" data-id="{{print.id}}" data-remark="{{if print.remark!="" }}{{print.remark}}{{/if}}" data-num="({{print.num}})">'+
                        '<p>'+
                            '<span class="print-tspan">'+
                                '<span class="cur-span">当前使用: </span>'+
                                '<span>{{print.remark}}({{print.num}})</span>'+
                            '</span>'+
                            '<i class="i-check"></i>'+
                        '</p>'+
                    '</li>'+
                '{{/each}}';
//获取打印机
function getPrinters(){
    var args = {
        action:"get_printer_list",
        scene:1
    };
    $.postJson("/printerset",args,function(res){
        if(res.success){
            //用户使用的打印机
            var datalist = res.printer_list;
            var pos_print = {
                current_user_bind:0,
                id:-1,
                num:"pos",
                remark:"POS打印"
            };
            datalist.push(pos_print);
            if(datalist.length==0){
                $(".change_print").addClass("forbid_click");
                return false;
            }
            $("#change_plist").empty();
            var render = template.compile(print_item);
            var html = render(res);
            $("#change_plist").append(html);
            initPosPrint("init");
        }else{
            return Tip(res.error_text);
        }
    },function(){
        Tip(ERROR_TXT);
    },function(){
        Tip(TIMEOUT_TXT);
    });
}
//初始化pos打印机
function initPosPrint(type){
    if(window.localStorage){
        var storage = window.localStorage;
        if(type=="init"){
            if(storage.getItem("posprint")){
                $("#change_plist>li").removeClass("active");
                $(".print_-1").addClass("active");
                $(".change_print").attr("data-id","-1");
                $(".cur_print_num").text("POS打印(pos)");
                if(printer_source == "goodsadd"){ //商品添加编辑页
                    new_goods_clone.find(".cur_print_num").text("POS打印(pos)");
                }
            }
        }else if(type=="set"){
            storage.setItem("posprint",1);
        }else if(type=="del"){
            storage.removeItem("posprint");
        }
    }
}
//切换打印机
function changePrinter($obj){
    if($obj.hasClass("hide")){
        return false;
    }
    if($(".change_plist>li.active").size()==0){
        return Tip("请选择打印机");
    }
    var $printer = $(".change_plist>li.active"),
        print_id = $printer.attr("data-id"),
        print_num = $printer.attr("data-num"),
        remark = $printer.attr("data-remark"),
        cur_index = $printer.index() || 0;
    var printer_name = remark + print_num;
    var args = {
        action:"change_printer",
        printer_id:print_id
    };
    $obj.addClass("forbid");
    $.postJson("/printerset",args,function(res){
        $obj.removeClass("forbid");
        if(res.success){
            $(".change_print").attr("data-id",print_id);
            $(".pop-change").addClass("hide");
            if(printer_source == "mul"){ //一单多品页
                $(".cur_print_num").text(printer_name);
                $(".pop-print").removeClass("hide");
            }else if(printer_source == "goodsadd"){ //商品添加编辑页
                $(".cur_print_num").text(printer_name);new_goods_clone.find(".cur_print_num").text(printer_name);
            }else if(printer_source == "kaipiao"){ //开票页
                $(".cur_print_num").text(printer_name);
            }
        }else{
            $(".change_plist>li").removeClass("active").eq(cur_index).addClass("active");
            return Tip(res.error_text);
        }
    },function(){
        $obj.removeClass("forbid");
        $(".change_plist>li").removeClass("active").eq(cur_index).addClass("active");
        Tip(ERROR_TXT);
    },function(){
        $obj.removeClass("forbid");
        $(".change_plist>li").removeClass("active").eq(cur_index).addClass("active");
        Tip(TIMEOUT_TXT);
    });
}
