//<input type="text" class="" readonly="true" onclick="initMCalendar({dateFmt:'YYYY-MM-DD',sureDate:function(){dosome();}},$(this));">
var mCalendar=(function(){
    var _today=new Date();//今日
    var _date=new Date();//默认日期
    var _date_type="YYYY-MM-DD";//默认格式
    var _date_str='';
    var _year=0;
    var _month=0;
    var _day=0;
    var _week='';
    var _target=null;       //选择日期元素
    var _sureDate_func=null;  //确认日期后执行

    var weeks=['日','一','二','三','四','五','六'];
    var $head_year=null;
    var $head_month=null;
    var $head_date=null;
    var $head_week=null;
    return {
        init:function(obj,target){

            var dateFmt=obj.dateFmt;
            var sureDate=obj.sureDate;
            var default_date=target.attr("data-val");
            _target=target;
            if(default_date){
                _date=new Date(default_date);
            }
            if(dateFmt){//日期格式
                _date_type=dateFmt;
            }
            if(sureDate){//日期确认后方法
                _sureDate_func=sureDate;
            }
            mCalendar.show();
            $head_year=$("#mCalendar-modal .head_year");
            $head_month=$("#mCalendar-modal .head_month");
            $head_date=$("#mCalendar-modal .head_date");
            $head_week=$("#mCalendar-modal .head_week");
            mCalendar.setDateShow();
            $('.set_mcalendar').removeClass('week');
            if(target.hasClass('week')){
                $('.set_mcalendar').addClass('week')
            }
        },
        show:function(){
            if($("#mCalendar-modal").size()==0){
                var mcalendarbox='<div id="mCalendar-modal">'+
                    '    <div class="mcalendar-content">'+
                    '        <div class="mcalendar-head">'+
                    '            <p class="f16"><span class="head_year">2017</span>年</p>'+
                    '            <p class="f24"><span class="head_month">8</span>月<span class="head_date">10</span>日&nbsp;&nbsp;周<span class="head_week">四</span></p>'+
                    '        </div>'+
                    '        <div class="mcalendar-body">'+
                    '            <div class="tab-month">'+
                    '                <a class="show-month f16" href="javascript:;">2017年2月</a>'+
                    '                <a class="prev-month" href="javascript:;"></a>'+
                    '                <a class="next-month" href="javascript:;"></a>'+
                    '            </div>'+
                    '            <div class="week-box group">'+
                    '                <span>日</span>'+
                    '                <span>一</span>'+
                    '                <span>二</span>'+
                    '                <span>三</span>'+
                    '                <span>四</span>'+
                    '                <span>五</span>'+
                    '                <span>六</span>'+
                    '            </div>'+
                    '            <div class="days-box group">'+
                    '            </div>'+
                    '        </div>'+
                    '        <div class="mcalendar-foot group">'+
//                    '            <a class="mcalendar-btn clean_mcalendar" href="javascript:;">清除</a>'+
                    '            <a class="mcalendar-btn fr set_mcalendar" href="javascript:;">设置</a>'+
                    '            <a class="mcalendar-btn fr mr30 candel_mcalendar" href="javascript:;">取消</a>'+
                    '        </div>'+
                    '    </div>'+
                    '</div>';;
                $("body").append(mcalendarbox);
            }
            $("#mCalendar-modal").removeClass("hidden");
            mCalendar.changeDate();
            ModalHelper.afterOpen();
        },
        hide:function(){//隐藏
            ModalHelper.beforeClose();
            $("#mCalendar-modal").addClass("hidden");
        },
        cleanDate:function(){//清除
            _target.val("");
            _date=new Date();
            mCalendar.hide();
        },
        setDate:function(){//确认设置
            var select_date=_date_str;
            _target.attr("data-val",select_date)
            if($('.set_mcalendar').hasClass('week')){
                var week_day = getDateAfter_n(select_date,7,'.');
                var temp = select_date.toString().split("-");
                temp = temp[1]+'.'+temp[2];
                select_date = temp+' - '+week_day;
            }
            _target.val(select_date);
            mCalendar.hide();
            if(_sureDate_func){
                _sureDate_func();
            }
        },
        prev_month:function(){
            var month=_date.getMonth()-1;
            _date.setMonth(month);
            mCalendar.changeDate();
            mCalendar.setDateShow();
        },
        next_month:function(){
            var month=_date.getMonth()+1;
            _date.setMonth(month);
            mCalendar.changeDate();
            mCalendar.setDateShow();
        },
        tabday:function($day){
            var select_day=$day.attr("data-day");
            _date.setDate(select_day);
            mCalendar.changeDate();
            mCalendar.setDateShow();
        },
        changeDate:function(){
            mCalendar.getDateStr();
            var days_str=mCalendar.getDays();
            $("#mCalendar-modal .days-box").html(days_str);
        },
        setDateShow:function(){
            //头部展示日期信息
            $head_year.text(_year);
            $head_month.text(_month);
            $head_date.text(_day);
            $head_week.text(_week);
        },
        getDateStr:function(date){
            var sdate=_date;
            if(date){
                sdate=date;
            }
            _year = sdate.getFullYear();
            _month = sdate.getMonth()+1;
            _day = sdate.getDate();
            _week=weeks[sdate.getDay()];
            $("#mCalendar-modal .show-month").text(_year+"年"+_month+"月");
            var month=_date_type.indexOf('MM') > -1 ? ('0' + _month).slice(-2) : _month;
            var day=_date_type.indexOf('DD') > -1 ? ('0' + _day).slice(-2) : _day;
            _date_str = _year+"-"+month+"-"+day;
            return _date_str;
        },
        getDays:function(){
            var $ = new Date();
            $.setFullYear(_date.getFullYear());
            $.setMonth(_date.getMonth());
            $.setDate(1);
            var d_index= $.getDay();//本月第一天星期几
            var days_num=30;//本月多少天
            if (/^(1|3|5|7|8|10|12)$/.test(_month)) {
                days_num=31;
            }
            else if (/^(4|6|9|11)$/.test(_month)) {
                days_num=30;
            }else{
                //二月
                if ((_year % 4 == 0 && _year % 100 != 0) || _year % 400 == 0) {
                    days_num=29;
                } else {
                    days_num=28;
                }
            }
            var days_str = '';
            for (var i = 0, j = d_index; i < j; i++) {
                days_str += '<a class="day day-null" href="javascript:;">&nbsp;</a>';
            }
            for (var i = 1, j = days_num; i <= j; i++) {
                var c = '';
                //今天
//                if (i == _today.getDate() && _month == _today.getMonth()+1 && _year == _today.getFullYear()) {
//                    c += ' today';
//                }
                //当前日期
                if (i == _day) {
                    c += ' this';
                }
                days_str += '<a class="day' + c + '" href="javascript:;" data-day="'+i+'">' + i + '</a>';
            }
            return days_str;
        }
    }
})();

$(document).ready(function(){

}).on("click","#mCalendar-modal .day",function(){
    var $this=$(this);
    if($this.hasClass("day-null")){
        return false;
    }
    mCalendar.tabday($this);
}).on("click","#mCalendar-modal .candel_mcalendar",function(){//取消
    mCalendar.hide();
}).on("click","#mCalendar-modal .clean_mcalendar",function(){//清除
    mCalendar.cleanDate();
}).on("click","#mCalendar-modal .set_mcalendar",function(){//设置
    mCalendar.setDate();
}).on("click","#mCalendar-modal .prev-month",function(){
    mCalendar.prev_month();
}).on("click","#mCalendar-modal .next-month",function(){
    mCalendar.next_month();
}).on("touchend","#mCalendar-modal",function(e){
    if($(e.target).closest(".mcalendar-content").size()==0){
        mCalendar.hide();
    }
});
function initMCalendar(obj,target){
    mCalendar.init(obj,target);
}
//解决滚动穿透
var ModalHelper = (function(bodyCls) {
    var scrollTop;
    return {
        afterOpen: function() {
            scrollTop = $(window).scrollTop();
            document.body.classList.add(bodyCls);
            document.body.style.top = -scrollTop + 'px';
        },
        beforeClose: function() {
            document.body.classList.remove(bodyCls);
            $(window).scrollTop(scrollTop);
        }
    };
})('modal-open');



/**
 * 计算n天后的日期
 * initDate：开始日期，默认为当天日期， 格式：yyyymmdd/yyyy-mm-dd
 * days:天数
 * flag：返回值， 年与日之间的分隔符， 默认为xxxx年xx月xx日格式
 * 调用函数示例，getDateAfter_n('20180315',7,'-');
 * 此算法是为解决给定出事日期计算一周后的时间。
 */
function getDateAfter_n(initDate, days, flag){
    if(!days){
        return initDate;
    }
    initDate = initDate.replace(/-/g,'');
    flag = $.trim(flag);
    var date;
    // 是否设置了起始日期
    if(!$.trim(initDate)){ // 没有设置初始化日期，就默认为当前日期
        date = new Date();
    }else{
        var year = initDate.substring(0,4);
        var month = initDate.substring(4,6);
        var day = initDate.substring(6,8);
        date = new Date(year, month-1, day); // 月份是从0开始的
    }
    date.setDate(date.getDate() + days);

    var yearStr = date.getFullYear();
    var monthStr = ("0"+(date.getMonth()+1)).slice(-2, 8); // 拼接2位数月份
    var dayStr = ("0"+date.getDate()).slice(-2, 8); // 拼接2位数日期
    var result = "";
    if(!flag){
        result = yearStr+"年"+monthStr+"月"+dayStr+"日";
    }else{
        // result = yearStr+flag+monthStr+flag+dayStr+flag;
        result = monthStr+flag+dayStr;
    }
    return result;
}
