$(function() {
    //切换状态
    $(".nav-tabs-li").bind("click", function () {
        $(".nav-tabs-li").removeClass('active');
        $(this).addClass('active');
    });

    //上传新数据
    $('#upload-btn').bind("click",function(){
        $('.data-div').css("display","none");
        $('.form-div').css("display","block");
    });

    var $formDiv = $('#form-div');
    //提交表单
    $formDiv.find('.btn-submit').on('click',function () {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/admin/upload',
            data: {
                action:"add_analyze_request",
                patient_name: $formDiv.find('#Input1').val(),
                patient_idnumber: $formDiv.find('#Input2').val(),
                sex:$formDiv.find('[type="radio"]:checked').val(),
                describe: $formDiv.find('#Input3').val(),
                measuring_position: $formDiv.find('#Input4').val(),
                measuring_method: $formDiv.find('#Input5').val(),
                measuring_date: $formDiv.find('#Input6').val()
            },
            dataType:'json',
            success:function (result) {
                $formDiv.find('.help-block').html('上传成功');
                if(!result.code){
                    //注册成功
                    setTimeout(function(){
                        $('.data-div').css("display","block");
                        $('.form-div').css("display","none");
                    },1000);
                    window.location.reload();
                }
            }
        })
    });

    //分片上传
    $(function (){
        document.getElementById('InputFile').addEventListener('change', function (ev) {
            console.log(ev.target.files);
            //预览，主要是文件转换为base64，或者blob，或者canvas
            //file -> base64
            // file为前面获得的
            console.log(ev.target.files[0]);
            var file = ev.target.files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image;
                img.src = this.result;  // this.result 为base64
                //console.log(this.result)
                // 加到dom
            };
            reader.readAsDataURL(file);
            var url = window.URL.createObjectURL(file);
            var img = new Image;
            img.src = url;
            //console.log(img)
            // 加到dom
            console.log(file);
            /*********************************************尝试分片，创建多个上传的xhr对象****************************************/
            var bytesPerPiece = 1024 * 1024; // 每个文件切片大小定为1MB
            var totalPieces;
            var blob = file;
            var start = 0;
            var end;
            var index = 0;
            var filesize = blob.size;
            var filename = blob.name;

            //计算文件切片总数
            totalPieces = Math.ceil(filesize / bytesPerPiece);
            while(start < filesize) {
                //判断是否是最后一片文件，如果是最后一篇就说明整个文件已经上传完成
                if (index === totalPieces) {
                    console.log('整个文件上传完成');
                    return false;
                }
                end = start + bytesPerPiece;
                if(end > filesize) {
                    end = filesize;
                }
                var chunk = blob.slice(start,end);//切割文件
                var sliceIndex = index;
                var formData = new FormData();
                formData.append("file", chunk, filename);
                formData.append("total", totalPieces);  //总片数
                formData.append("index", sliceIndex);   //当前是第几片
                var xhr = new XMLHttpRequest();
                //上传文件进度条
                xhr.upload.addEventListener("progress", function(e){
                    if (e.total > 0) {
                        console.log('----进度-----');
                        //e.percent = Math.round(e.loaded / e.total * 100);
                        //(e.loaded当前片文件上传的上传的进度 start是前面分片已经上传完成的文件大小
                        e.percent = 100*(e.loaded+start)/file.size;
                        if(e.percent > 100){
                            e.percent = 100;
                        }
                        console.log( e.percent);
                        console.log('----进度-----')
                    }
                }, false);
                url = 'http://bodyscan.com.cn:9999/admin';
                xhr.open('post', url, true);
                console.log(5);
                xhr.onload = function () {
                    console.log(45)
                };
                xhr.send(formData);
                start = end;
                index++;
            }
            /*********************************************尝试分片****************************************/
        })
    });
});


