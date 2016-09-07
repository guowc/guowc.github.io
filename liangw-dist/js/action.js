$(function(){
    var CITY = ['驻马店遂平','周口太康','驻马店西平','平舆','周口商水','漯河市','周口沈丘','南阳市'];
    var TOWNS = {
        '驻马店遂平': ['和兴乡','阳丰乡','车站乡','嵖岈山乡','沈寨乡'],
        '周口太康': ['逊母口镇','太徐寨乡','符草楼乡','转楼乡'],
        '驻马店西平': ['宋集乡','盆尧乡','专探乡','芦庙乡'],
        '周口商水': ['张明','舒庄','太武','张庄'],
        '漯河市' : ['邓襄镇','万金乡','大刘乡','老窝乡'],
        '周口沈丘' : ['莲池乡','刘庄店镇','付井镇','周营乡'],
        '南阳市' : ['红泥湾乡','高庙乡','茶庵乡','汉塚乡'],
        '平舆' : ['余金鸽']
    };
    var addr_option_tpl = '<span class="ops J_addr_option" data-value="@value"><span class="text">@value</span><i class="rm"></i></span>';
    var $btn_addr = $("#J_btn_addr");
    var $btn_join = $("#J_btn_join");
    var $modal_addr = $("#J_modal_address");
    var $city = $("#J_city");
    var $towns = $("#J_towns");
    var $city_ops = $("#J_city .ops");
    var $addr_ops = $(".J_addr_option");
    var $addr_submit = $("#J_modal_address .submit");
    var $addr_show = $("#J_address");
    var $addr_res = $("#J_addr_result");
    $btn_addr.bind('tap',function(){
        initAddress();
        $modal_addr.addClass('show');
    });
    $modal_addr.find('.close').bind('tap',function(){
        $modal_addr.removeClass('show');
    });
    $city_ops.live('tap',function(){
        var val = $(this).data('value');
        var towns = TOWNS[val];
        var tpl = '';
        for(var i = 0; i< towns.length;i++){
            tpl += addr_option_tpl.replace(/@value/g,towns[i])
        }
        $towns.html(tpl);
    });
    $addr_ops.live('tap',function(){
        $(this).addClass('selected').siblings().removeClass('selected');
    });
    $addr_submit.bind('tap',function(){
        var city_val = $city.find('.selected').data('value');
        var towns_val = $towns.find('.selected').data('value');
        var addr_val = '';
        if(!towns_val){
            alert("请选择乡镇!");
        }else{
            addr_val = city_val + ' ' + towns_val;
            $modal_addr.removeClass('show');
            $addr_show.html('<span class="option" id="J_addr_result">'+ addr_val +'<i class="rm"><i></span>');
            $btn_addr.hide();
        }
    });
    $addr_res.live('tap',function(){
        $(this).remove();
        $btn_addr.show();
    });
    $btn_join.bind('tap',function(){
        $("#J_modal_join").addClass('show');
    });
    $("#J_voteit").bind('tap',function(){
        $(this).addClass('btn-dis');
    });
    $(".J_link").bind('tap',function(){
        location.href = $(this).data('link');
    })
    $(".J_btn_auth").bind('tap',function(){
        $(this).addClass('authed').text('已授权');
    });
    $(".J_btn_vote").bind('tap',function(){
        $(this).addClass('voted').text('已助威');
    });
    $("#J_upload_avatar").on("change",function(){
        var file = this.files[0];
        upload(file,100,function(data){
            $("#J_avatar_target").attr('src',data);
        });
    });
    $("#J_upload_img").on("change" , function (){
        var file = this.files[0];
        upload(file,200,function(data){
            var tpl = '<li><div class="imgbox"><img src="'+ data +'"></div><em class="rm"></em></li>';
            $("#J_upload_target").append(tpl);
            var len = $("#J_upload_target li").length;
            if(len == 3){
                $("#J_upload_img_box").hide();
            }
        });
    });
    $("#J_upload_target .rm").live('tap',function(){
        $(this).parent().remove();
        var len = $("#J_upload_target li").length;
        if(len < 3){
            $("#J_upload_img_box").show();
        }
    });
    function upload(file,width,callback){
        var cbk = callback || {};
        var fileType =['image/jpeg','image/jpg','image/png'];
        var filename = file.name;
        var type = ('image/'+filename.substring(filename.lastIndexOf('.')+1,filename.length)).toLocaleLowerCase();
        if ((fileType.join().toString()).indexOf(type)==-1) {
            setTimeout(function(){
                alert('只允许上传JPG、PNG格式图片！');
            },0);
            //setTimout 防止ios下出现卡死现象
            file.value = '';
            return false;
        }
        $(this).val('');
        canvasResize(file, {
            width: width,
            crop: false,
            rotate: 0,
            callback: function(data, width, height) {
                cbk(data);
            }
        });
    }
    function initAddress(){
        var tpl = '';
        for(var i=0; i<CITY.length; i++){
            tpl += addr_option_tpl.replace(/@value/g,CITY[i]);
        }
        $city.html(tpl);
        $("#J_city .ops").eq(0).trigger('tap');
    }

});
