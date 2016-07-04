$(function(){
	$(".timeline li,.imglist li,.cardlist li").bind("mouseover",function(){
		$(this).addClass("hover");
	}).bind("mouseout",function(){
		$(this).removeClass("hover");
	});

	$("#j-backtop").bind("click",function(){
		if($.browser.webkit){
			$("body").stop().animate({"scrollTop":0},500);
		}
		else{
			$(document.documentElement || document.body).stop().animate({"scrollTop":0},500);
		}
		return false;
	});

	//ie6 回到顶部
	function getScrollTop(){
		return  document.documentElement.scrollTop || document.body.scrollTop;
	};

	function getVisibleSize(){
		return {
			width : window.innerWidth || document.documentElement.clientWidth,
			height : window.innerHeight || document.documentElement.clientHeight
		}
	};

	function timerFun(){
	    var h = getVisibleSize().height;
	    var height = $("#j-backtop").height(); 
	    $("#j-backtop").stop().animate({
	    	top : getScrollTop() + (h - height) / 2
	    }, 200);
	}; 

	if($.browser.msie && $.browser.version=="6.0"){
	    setInterval(timerFun,300);
	};
});
