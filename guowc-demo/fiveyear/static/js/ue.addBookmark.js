/**
 * @description    : 收藏组件 ue.addBookmark
 * @author         : zhengguobao@4399.com
 * @change details : 2012-12-18 created by f2er
 * @parameter      : addBookmark : 添加收藏组件
 * @parameter      : name : 标题
 * @parameter      : href : 收藏地址
 * @details        : api http://t2.s.img4399.com/base/js/plugins/ue.addBookmark/ hostip 192.168.51.203
 */
(function($,win,undefined){
    function addBookmark(name,href){
        var title = name || document.title,
            url = href || document.location.href;
        if(window.sidebar){
            window.sidebar.addPanel(title,url,'');
        }else{
            try{
                window.external.AddFavorite(url,title);
            }catch(e){
                alert("您的浏览器不支持该功能,请使用Ctrl+D收藏本页");
            }
        }
    }
    win.ue = win.ue || {};
    ue.addBookmark = addBookmark;
})(jQuery,window);