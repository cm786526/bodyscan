/*
calendar
<span class="wrap-simple-calendar"><input class="simple-calendar" type="text" data-maxtoday="true" calendar="YYYY-MM-DD" onFocus="SimpleCalendar({sureDate:function(){test();}});"/></span>
test();为确定日期后执行的方法
data-max="today" 表示今日是最大选择日期
*/
(function () {
    for (var $ = '', i = 1940, j = 2030; i <= j; i++) {
        $ += '<a href="javascript:;">' + i + '</a>';
        if ((i + 1) % 10 == 0) {
            $ += '</span><span>';
        }
    }
    document.write(
            '<div class="calendar false">'
            + '	<div class="full">'
            + '		<a class="showMonth f16" href="javascript:;"><span class="year" ></span>年<span class="month"></span>月</a>'
            + '		<a class="prev" href="javascript:;"></a>'
            + '		<a class="next" href="javascript:;"></a>'
            + '	</div>'
            + ' <div class="full-year false">'
            + '   <span>' + $ + '</span>'
            + ' </div>'
            + ' <div class="full-month group false">'
            + '   <a href="javascript:;">1月</a>'
            + '   <a href="javascript:;">2月</a>'
            + '   <a href="javascript:;">3月</a>'
            + '   <a href="javascript:;">4月</a>'
            + '   <a href="javascript:;">5月</a>'
            + '   <a href="javascript:;">6月</a>'
            + '   <a href="javascript:;">7月</a>'
            + '   <a href="javascript:;">8月</a>'
            + '   <a href="javascript:;">9月</a>'
            + '   <a href="javascript:;">10月</a>'
            + '   <a href="javascript:;">11月</a>'
            + '   <a href="javascript:;">12月</a>'
            + ' </div>'
            + '	<div class="week group">'
            + '		<span>日</span>'
            + '		<span>一</span>'
            + '		<span>二</span>'
            + '		<span>三</span>'
            + '		<span>四</span>'
            + '		<span>五</span>'
            + '		<span>六</span>'
            + '	</div>'
            + '	<div class="days group">'
            + '		<!-- <a class="day" href="javascript:;"></a> -->'
            + '	</div>'
            + '	<div class="time wrap-calendar-type false calendar_multi">'
            + '		<input class="submit_today" type="button" value="回到今天"/>'
            + '     <a class="calendar-type calendar_type" href="javascript:;">区间筛选</a>'
            + '	</div>'
            + '	<div class="time calendar_single">'
            + '		<input class="submit_today" type="button" value="今天"/>'
            + '	</div>'
            + '</div>'
    );
})();

(function () {
    /* 元素 */
    {
        var calendar = jQuery('div.calendar');
        var calendar_full = jQuery('div.calendar div.full');
        var calendar_fullYear = jQuery('div.calendar div.full-year a');
        var calendar_fullMonth = jQuery('div.calendar div.full-month');
        var calendar_showFullMonth = jQuery('div.calendar .showMonth');
        var calendar_week = jQuery('div.calendar div.week');
        var calendar_days = jQuery('div.calendar div.days');
        var calendar_time = jQuery('div.calendar div.time');
        var calendar_year = jQuery('div.calendar span.year');
        var calendar_month = jQuery('div.calendar span.month');
        var calendar_hours = jQuery('div.calendar input.hours');
        var calendar_minutes = jQuery('div.calendar input.minutes');
        var calendar_seconds = jQuery('div.calendar input.seconds');
    }
    /* 变量 */
    {
        var t;  //日期的input元素
        var a;  //日期格式
        var d;
        var i;
    }
    /* 格式 */
    {
        var format_year = function (p/* Number param */) {
            return p;
        };
        var format_month = function (p/* Number param */) {
            return a.indexOf('MM') > -1 ? ('0' + (p + 1)).slice(-2) : (p + 1);
        };
        var format_date = function (p/* Number param */) {
            return a.indexOf('DD') > -1 ? ('0' + p).slice(-2) : p;
        };
        var format_hours = function (p/* Number param */) {
            return a.indexOf('hh') > -1 ? ('0' + p).slice(-2) : p;
        };
        var format_minutes = function (p/* Number param */) {
            return a.indexOf('mm') > -1 ? ('0' + p).slice(-2) : p;
        };
        var format_seconds = function (p/* Number param */) {
            return a.indexOf('ss') > -1 ? ('0' + p).slice(-2) : p;
        };
    }
    /* 计算 */
    {
        var full = function (p/* Object param */) {
            //年
            jQuery(calendar_year).html(format_year(p.getFullYear()));
            //月
            jQuery(calendar_month).html(format_month(p.getMonth()));
            //时
            jQuery(calendar_hours).val(format_hours(p.getHours()));
            //分
            jQuery(calendar_minutes).val(format_minutes(p.getMinutes()));
            //秒
            jQuery(calendar_seconds).val(format_seconds(p.getSeconds()));
        };
        var days = function (p/* Object param */) {
            var $ = '';
            for (var i = 0, j = days_index(p); i < j; i++) {
                $ += '<a></a>';
            }
            for (var i = 1, j = days_count(p), k = days_today(p); i <= j; i++) {
                var c = '';
                //今天
                if (i == k) {
                    c += ' this';
                }
                //索引
                if (i == d.getDate() && p.getMonth() == d.getMonth() && p.getFullYear() == d.getFullYear()) {
                    c += ' index';
                }
                if(t.getAttribute("data-max") == "today"){ //最大日期为今日
                    var now_time = new Date();
                    var now_year = now_time.getFullYear();
                    var now_month = now_time.getMonth();
                    var p_year = p.getFullYear();
                    var p_month = p.getMonth();
                    if((k>0&&i>k) || p_year>now_year || (p_year == now_year && p_month>now_month)){
                        c += ' error';
                    }
                }
                $ += '<a class="day' + c + '" href="javascript:;">' + format_date(i) + '</a>';
            }
            jQuery(calendar_days).html($);
        };
        var days_index = function (p/* Object param */) {
            var $ = new Date();
            $.setFullYear(p.getFullYear());
            $.setMonth(p.getMonth());
            $.setDate(1);
            return $.getDay();
        };
        var days_count = function (p/* Object param */) {
            var $ = p.getMonth() + 1;
            if (/^(1|3|5|7|8|10|12)$/.test($)) {
                return 31;
            }
            if (/^(4|6|9|11)$/.test($)) {
                return 30;
            }
            //二月
            $ = p.getFullYear();
            if (($ % 4 == 0 && $ % 100 != 0) || $ % 400 == 0) {
                return 29;
            } else {
                return 28;
            }
        };
        var days_today = function (p/* Object param */) {
            var $ = new Date();
            if ($.getMonth() == p.getMonth() && $.getFullYear() == p.getFullYear()) {
                return $.getDate();
            } else {
                return 0;
            }
        };
    }
    /* 行为 */
    {
        var action = function (e/* Object event */) {
            //action_reset();
            try {
                var g = e.target;
                if (g.className.indexOf('prev') > -1) {
                    action_prev(g)
                }
                if (g.className.indexOf('next') > -1) {
                    action_next(g)
                }
                if ($(g).hasClass("day")) {
                    action_day(g)
                }
                if ($(g).hasClass("submit")) {
                    action_submit(g)
                }
                if ($(g).hasClass("submit_today")) {
                    action_submitToday(g)
                }
                if ($(g).hasClass("calendar_type")) { //区间-单日 筛选
                    var $wrap = $(t).closest(".wrap_calendar_type2");
                    var $dateEnd = $wrap.find(".calendar_end");
                    $dateEnd.toggleClass("hide");
                    $wrap.find(".simple-calendar").toggleClass("multi");
                    if($dateEnd.hasClass("hide")){
                        $wrap.find(".start_date_title").text("日期选择");
                    }else{
                        $wrap.find(".start_date_title").text("起始日期");
                        $wrap.find(".end_calendar").val($wrap.find(".start_calendar").val());
                    }
                    display(0);
                }
                if ($(g).closest(".showMonth").size() == 0) {
                    jQuery(calendar_fullMonth).addClass("false");
                }else{
                    action_showmonth();
                }
                e.stopPropagation();
            } catch (ex) {
                return;
            }
        };
        var action_fullYear = function (e/* Object event */) {
            try {
                i.setYear(e.target.innerHTML);
                full(i);
                days(i);
            } catch (ex) {
                return;
            }
        };
        var action_fullMonth = function (e/* Object event */) {
            try {
                i.setMonth(parseInt(e.target.innerHTML) - 1);
                full(i);
                days(i);
                jQuery(calendar_fullMonth).addClass("false");
            } catch (ex) {
                return;
            }
        };
        var action_prev = function (p) {
            i.setMonth(i.getMonth() - 1);
            full(i);
            days(i);
        };
        var action_next = function (p) {
            i.setMonth(i.getMonth() + 1);
            full(i);
            days(i);
        };
        var action_showmonth = function () {
            jQuery(calendar_fullMonth).toggleClass("false");
        }
        var action_day = function (p) {
            d.setFullYear(i.getFullYear());
            d.setMonth(i.getMonth());
            d.setDate(p.innerHTML);
            if(t.getAttribute("data-max") == "today"){
                if(Date.parse(d)>Date.now()){
                    return false;
                }
            }
            days(i);
            action_submit();
        };
        var action_submit = function (p) {
            t.value = a.replace(/[a-zA-Z]+/g, function ($) {
                switch ($.charAt(0)) {
                    case 'Y' :
                        return format_year(d.getFullYear());
                    case 'M' :
                        return format_month(d.getMonth());
                    case 'D' :
                        return format_date(d.getDate());
                    case 'h' :
                        return format_hours(d.getHours());
                    case 'm' :
                        return format_minutes(d.getMinutes());
                    case 's' :
                        return format_seconds(d.getSeconds());
                }
            });
            display(0);
            action_sureDateFunction();//日期确定后执行的方法
        };
        var action_submitToday=function(p){
            var today=new Date();
            i = today;
            d = today;
            days(i);
            action_submit();
        }
        var action_reset = function () {
            jQuery(calendar_fullYear).attr('class', 'full-year false');
            jQuery(calendar_fullMonth).attr('class', 'full-month false');
        };
    }
    /* 方法 */
    {
        var main = function (e/* Object event */) {
            try {
                if (e.target.getAttribute('calendar')) {
                    t = e.target;
                    a = t.getAttribute('calendar');
                    var date=$(t).val();
                    var default_date=new Date();
                    if(date){
                        date=new Date(date);
                        default_date.setFullYear(date.getFullYear());
                        default_date.setMonth(date.getMonth());
                        default_date.setDate(date.getDate());
                    }
                    i = default_date;
                    d = default_date;
                    if (a == 'true') {
                        a = 'YYYY/M/D hh:mm';
                    }
                    full(i);
                    days(i);
                }
                display(e);
            } catch (ex) {
                return;
            }
        };
        var display = function (e/* Object event */) {
            try {
                if (e == 0) {
                    jQuery(calendar).addClass('false');
                    return false;
                }
                for (var t = e.target; t; t = t.parentNode) {
                    if (t.getAttribute('calendar')) {
                        break;
                    }
                    if (t.className.indexOf('calendar') > -1) {
                        return;
                    }
                }
                jQuery(calendar).css({
                    'left': (jQuery(t).offset().left-4) + 'px',
                    'top': (jQuery(t).offset().top + jQuery(t).height() + 6) + 'px'
                });
                jQuery(calendar).removeClass("false");
            } catch (ex) {
                jQuery(calendar).addClass('false');
                jQuery(calendar_fullMonth).addClass("false");
            }
        };
    }
    {
        //主体
        jQuery(document).focusin(main);
        //显示
        jQuery(document).click(display);
        //日历行为
        jQuery(calendar).click(action);
        //年份行为
        jQuery(calendar_fullYear).click(action_fullYear);
        //月份行为
        jQuery(calendar_fullMonth).click(action_fullMonth);
    }
})();
var action_sureDateFunction = null;
function SimpleCalendar(object,target) {
    //日期确认后执行
    if (object.sureDate) {
        action_sureDateFunction = object.sureDate;
    }
    if(object.type == 2){ //表示为区间筛选
        $(".calendar .calendar_single").addClass("false");
        $(".calendar .calendar_multi").removeClass("false");
        if(target.hasClass("multi")){
            $(".calendar .calendar_type").text("查看单日");
            action_sureDateFunction = null;
        }else{
            $(".calendar .calendar_type").text("区间筛选");
        }
    }else{
        $(".calendar .calendar_single").removeClass("false");
        $(".calendar .calendar_multi").addClass("false");
    }
}
