/**
 * @description    : 对话框组件 ue.dialog
 * @author         : chenxizhong@4399.net
 * @change details : 2012-11-27 created by czonechan
 * @parameter      : 
 * @details        : api http://t2.s.img4399.com/base/js/plugins/ue.dialog/ hostip 192.168.51.203
 */
 (function($, window, document, undefined){
	var instanceId = 0,
		prefix = "ui-dialog_",
		zIndex = 1989,
		mask = [],
		noop = function(){},
		autoSize_tmpl,
		dialog_tmpl,
		ie6 = $.browser.msie && $.browser.version=="6.0",
		last_window_resize_time = new Date(),
		last_window_resize_time_follow = new Date();
	
	dialog_tmpl ='	<div class="ui-dialog" id ="@{id}">@{content}</div>';
	autoSize_tmpl = '	<div class="ui-dialog-autoSize" style="position:absolute; top:-10000px;">\
							<table class="ui-dialog-autoSize-table" style="border-collapse:collapse;border-spacing:0;">\
								<tr><td style="margin:0;padding:0">\
									<div class="ui-dialog" style="overflow:hidden;">@{content}</div>\
								</td></tr>\
							</table>\
					 	</div>';
	
	/*简易模版函数*/
	function template(tmpl,json){
		if (typeof tmpl !== "string" || typeof json !== "object") return "";
		return tmpl.replace(/\@{([a-zA-Z_0-9\-]*)\}/g, function (all, key) {
			return typeof json[key] !== "undefined" ? json[key] : ""
		});
	}
	
	/*获取浏览器可见区域的高度*/
	function getVisibleWidth(){
		return window.innerWidth || document.documentElement.clientWidth;
	}
	
	/*获取浏览器可见区域的宽度*/
	function getVisibleHeight(){
		return window.innerHeight || document.documentElement.clientHeight;
	}
	
	/*获取滚动条滚动的高度*/
	function getScrollTop(){
		return  document.documentElement.scrollTop || document.body.scrollTop;
	}

	/*获取滚动条滚动的高度*/
	function getScrollLeft(){
		return  document.documentElement.scrollLeft || document.body.scrollLeft;
	} 
	
	/*显示蒙层*/
	function setLock(dialog){
		var width = "100%";
		
		if (ie6){
			//有水平滚动条
			if ($(document.body).width() > getVisibleWidth()){
				width = $(document.body).width();
			}
			
			$(window).unbind("resize.lock").bind("resize.lock", function(){
				if (new Date() - last_window_resize_time < 100){
					return false;
				}
				
				last_window_resize_time = new Date();
				
				//有水平滚动条
				if ($(document.body).width() > getVisibleWidth()){
					width = $(document.body).width();
				} else {
					width = "100%";
				}
				
				$(".ui-dialog-mask").width(width);
			})
		}

		var defaults = {
				opacity : 0.3,
				width : width,
				height : $(document).height(),
				"background-color" : "#000000",
				position : ie6 ? "absolute" : "fixed",
				left : 0,
				top : 0,
				"z-index" : dialog.options.zIndex - 1
			};
		
		if($(".ui-dialog-mask").length == 0){
			$("body").append($('<div class="ui-dialog-mask"></div>'));
			$(".ui-dialog-mask").unbind("click").bind("click", function(){
				mask[mask.length-1].close();
			})
		}
		
		$(".ui-dialog-mask").css(defaults).show();
		mask.push(dialog);
	}
	
	function unlock(){
		if(mask.length == 0) return ;
		mask.pop();
		if(mask.length == 0){
			$(".ui-dialog-mask").remove();
		}else{
			if (ie6){
				$(".ui-dialog-mask").show().css("z-index",mask[mask.length-1].options.zIndex - 1);
			}else {
				$(".ui-dialog-mask").show().css({"z-index" : mask[mask.length-1].options.zIndex - 1, left : getScrollLeft()});
			}
		}
	}
	
	if(document.addEventListener){
		document.addEventListener("focus", function(e) {
		
			if (mask.length > 0){
				var current = mask[mask.length - 1];
				var contains = $(e.target).parents("#" + current.obj.attr("id"));
				
				
				if (current.obj.css("display") !== "none" && contains.length == 0){
					e.stopPropagation();
					current.obj.focus();
				}
			}
		
		}, true);

		document.addEventListener("keydown", function(e){
			if (e.keyCode == 27 && mask.length > 0){
				var current;
				
				for (var i = mask.length - 1; i >=0 ;i--){
					current = mask[i];
					if (current.obj.css("display") !== "none"){
						current.close();
						break;
					}
				}
			}
		}, true);

	} else {
		document.attachEvent("onfocusin", function() {

			if (mask.length > 0){
				var current = mask[mask.length - 1];
				var contains = $(event.srcElement).parents("#" + current.obj.attr("id"));

				if (current.obj.css("display") !== "none" && contains.length == 0){
					event.cancelBubble = true;
					current.obj.focus();
				}
			}
		
		});

		document.attachEvent("onkeydown", function(){
			var e = event;
			if (e.keyCode == 27 && mask.length > 0){
				var current;
				
				for (var i = mask.length - 1; i >=0 ;i--){
					current = mask[i];
					if (current.obj.css("display") !== "none"){
						current.close();
						break;
					}
				}
			}
		}, true);
	}
	
	/*构造函数*/
	function ctor(options){
		var defaults = {
				id : "",//弹窗的id。参数值为ID名称
				force : false,//如果已经存在相同id的弹窗 是否强制关闭 ，参数值格式 false | true
				
				triggerTarget : null,//触发弹窗的对象，用于关闭弹窗后继续把焦点转移给它
				
				left : "auto",//设置弹出层的位置。默认值为auto,即居中。参数值为 数字 | "auto"
				right : "auto",//设置弹出层的位置。默认值为auto,即居中。参数值为 数字 | "auto"
				top : "auto",//设置弹出层的位置。默认值为auto,即居中。参数值为 数字 | "auto"
				bottom : "auto",//设置弹出层的位置。默认值为auto,即居中。参数值为 数字 | "auto"
				position : "absolute",//设置弹出层的定位的模式，默认值为absolute。如果lock 为 true 则 position 强制为 fixed。参数值为 absolute | fixed
				
				width : "auto",//设置弹出层的宽度，默认值为auto，即自适应模版的宽度。参数值格式为 ： 数字 | auto | 百分数("100%")
				height : "auto",//设置弹出层的高度，默认值为auto，即自适应模版的高度。参数值格式为 ： 数字 | auto | 百分数("100%")
				minWidth : "auto",//设置弹出层的最小宽度，默认值为auto，即不限制最小宽度。参数值格式为 ： 数字 | auto
				maxWidth : "auto",//设置弹出层的最大宽度，默认值为auto，即不限制最大宽度。参数值格式为 ： 数字 | auto
				
				lock : false,//是否显示遮罩层 参数值 ： false | true
				drag : false,//是否可以拖动 参数值: true | false
				dragHock : "",//设置可以拖动的元素 参数值：[string]jquery 选择符
				closeBtn : ".ui-dialog-close_btn",//关闭弹窗按钮的class
				
				zIndex : zIndex,//弹窗的zIndex
				
				content : "",//弹窗的内容
				init : noop,//设置弹窗初始化的方法
				beforeClose : noop,//关闭弹窗之前的回调函数
				afterClose : noop//关闭弹窗之后的回调函数
			},
			_this = this;
		
		options.id = options.id || prefix + (++instanceId);	
		options.zIndex = options.zIndex || ++zIndex;	
		options.position = options.position == "fixed" ? "fixed" : "absolute";//position fixed | absolute
		
		//如果锁屏则强制 设置弹窗固定居中					
		if (options.lock){
			options.position = "fixed";
			options.left = "auto";
			options.right = "auto";
			options.top = "auto";
			options.bottom = "auto";
			//console.log("document.activeElement", document.activeElement, $(document.activeElement));
			this.triggerTarget = options.triggerTarget;
		}	
		
		this.options = options = $.extend(defaults, options);
		
		//已有相同id的弹窗
		if (options.id && ctor.list[options.id]){
			if (options.force){
				ctor.list[options.id].close();
			} else {
				_this = ctor.list[options.id];
				_this.show();
				return _this;
			}
		}
		
		this.create();
		this.options.init.call(this);
		this.obj.find(options.closeBtn).bind("click", function(){
			_this.close.call(_this);
			return false;
		})
	}
	
	ctor.list = {};
	
	ctor.prototype={
		reset : function(){
			this.obj.height("auto");
			var new_height = this.obj.height();
			this._size.height = new_height;
			this._offset = this.offset(this._size);
			this.obj.css(this._size);
			
			if (ie6){
				this.ie6fixed.options["height"] = new_height;
			} else {
				this.obj.css(this._offset);
			}
		},
		
		/*自适应宽高*/
		autoSize : function(content, width){
			var options = this.options,
				$autoSize = $(template(autoSize_tmpl, {content : content})),
				size;
				
			$(document.body).append($autoSize);
			
			if (typeof width !== 'undefined'){
				$autoSize.find(".ui-dialog-autoSize-table").width(width);
			}
			
			size = {
				width : $autoSize.find(".ui-dialog-autoSize-table").width(),
				height : $autoSize.find(".ui-dialog-autoSize-table").height()
			}
			
			if (typeof width !== 'undefined'){
				size.width = width;
			}
			
			$autoSize.remove();
			
			return size;
		},
		
		/*根据内容计算宽高*/
		size : function(content){
			var options = this.options,
				width = options.width,
				height = options.height,
				content = options.content,
				size;
				
			if(typeof width === "number" || width !== "auto"){
				size = this.autoSize(content, width);
			} else {
				size = this.autoSize(content);
			}

			if(typeof width === "number"){
				size.width = width;
			}
			
			if(typeof height === "number"){
				size.height = height;
			}

			return size;
		},
		
		/*根据弹窗的大小计算弹窗的位置*/
		offset : function(size){
			var options = this.options,	
				position = options.position,
				lock = options.lock,
				left = options.left,
				top = options.top,
				bottom = options.bottom,
				right = options.right,
				vheight,
				_offset = {};
			
			//默认水平和垂直居中
			if(typeof left !== "number"  && typeof right  !== "number"){
				left = "auto";
				right = "auto";
			}
			
			if(typeof top !== "number" && typeof bottom  !== "number"){
				top = "auto";
				bottom = "auto";
			}
			
			(typeof top === "number") && (top = top < 0 ? 0 : top);
			(typeof left === "number") && (left = left < 0 ? 0 : left);
			(typeof right === "number") && (right = right < 0 ? 0 : right);
			(typeof bottom === "number") && (bottom = bottom < 0 ? 0 : bottom);
			
			_offset = $.extend(_offset, {
				left : left ,
				top : top ,
				bottom : bottom,
				right : right
			});
			
						
			if (left == "auto" && right == "auto"){
				_offset["left"] = "50%";
				if (position == "fixed"){
					_offset["margin-left"] = - size.width / 2;
				} else {
					_offset["margin-left"] = - size.width / 2 + getScrollLeft();
				}
			}
			
			if (top == "auto" && bottom == "auto"){
				if (position == "fixed"){
					_offset["margin-top"] = - size.height / 2;
					_offset["top"] = "50%";
				} else {
					_offset["top"] = getScrollTop() + getVisibleHeight()  / 2 - size.height / 2;
				}
			}
			
			return _offset;
		},
		
		create : function(){
			var options = this.options,
				position = options.position,
				hold = options.hold,
				content = options.content || options.loading || "loading",
				_this = this;
				
			var _dialog_tmpl = template(dialog_tmpl,{content : content, id : options.id});
			
			//蒙层只会存在一个，确保弹出层在蒙层的前面，当弹窗和蒙层Zindex 一样时 蒙层可以盖住弹窗
			if($(".ui-dialog-mask").length == 0){
				$("body").append(_dialog_tmpl);
			}else{
				$(".ui-dialog-mask").before(_dialog_tmpl);
			}
			
			this.obj = $("#" + options.id);
		
			var css = {
					zIndex : options.zIndex,
					position : position
				},
				size = this.size(),
				offset;

			if (this.options.minWidth !== "auto"){
				if (size.width < this.options.minWidth){
					size.width = this.options.minWidth;
				}
			}
			
			if (this.options.maxWidth !== "auto"){
				if (size.width > this.options.maxWidth){
					size.width = this.options.maxWidth;
				}
			}
			
			this._size = size;
			this._offset = offset = this.offset(size);
			
			$.extend(css, size);
			$.extend(css, offset);
			
			this.obj.css(css);

			//IE6 position fixed 解决方案
			if(ie6 && position == "fixed"){
				this.ie6fixed = ue.fixed({
					target : this.obj,
					left : options.left,
					right : options.right,
					top : options.top,
					bottom : options.bottom,
					height : size.height,
					width : size.width
				});
			}
			
			//模态弹窗
			if (options.lock){
				setLock(this);
				this.obj[0].tabIndex = -1;
				this.obj.focus();
			}
			if(this.options.drag && this.options.dragHock && $(this.options.dragHock).length > 0 && ue.easydrag){
				ue.easydrag({
					target : this.obj,
					hock : this.obj.find(this.options.dragHock)
				});
			}
			uiDialog.list[options.id] = this;
		},
		
		close : function(beforeClose, afterClose){
			var options = this.options;
			this.options.beforeClose = typeof beforeClose === "function" ? beforeClose : options.beforeClose;
			this.options.afterClose = typeof afterClose === "function" ? afterClose : options.afterClose;
			var is_close = options.beforeClose.call(this);
			if (is_close === false) return;//取消关闭
			this.obj.remove();
			this.options.lock && unlock(this);
			delete ctor.list[options.id];
			options.afterClose.call(this);
			if (this.triggerTarget){
				this.triggerTarget.focus();
			}
		},
		
		show : function(){
			this.options.lock && setLock(this);
			this.obj.show();
		},
		
		hide : function(){
			this.obj.hide();
			this.options.lock && unlock(this);
			if (this.triggerTarget){
				this.triggerTarget.focus();
			}
		},
		
		timer : function (delay,callback){
			var _this = this,
				callback = typeof callback === "function" ? callback : noop;
			
			setTimeout(function(){callback.call(_this)},delay);
		}
	};
	
	window.ue = window.ue || {};
	
	/*fixed 组件*/
	(function(){
		var fixList = [];
		
		var pre_scroll_top;
		var pre_scroll_left;
		
		function ctor(options){
			var defaults = {
				relative : $(),
				target : "",
				height : "auto",
				width : "auto",
				left : "auto",
				top : "auto",
				bottom : "auto",
				right : "auto"
			};
			
			options = this.options = $.extend(defaults, options);
			
			var css = {
				"position" : "absolute",
				"margin" : 0
			}
			
			//水平居中
			if (options.left == "auto" && options.right == "auto"){
				css["left"] = getScrollLeft() +  (getVisibleWidth() - options.width) / 2;
			}
			
			//垂直居中
			if (options.top == "auto" || options.bottom == "auto"){
				css["top"] = getScrollTop() +  (getVisibleHeight() - options.height) / 2;
			}
			
			if (typeof options.right === "number"){
				css["left"] = "auto";
				css["right"] = options.right;
			}
			
			if (typeof options.left === "number"){
				css["left"] = getScrollLeft() + options.left;
				css["right"] = "auto";
			}
			
			if (typeof options.bottom === "number"){
				css["top"] = "auto";
				css["bottom"] = options.bottom
			}
			
			if (typeof options.top === "number"){
				css["top"] = getScrollTop() + options.top;
				css["bottom"] = "auto";
			}
			
			if (ie6){
				pre_scroll_top = getScrollTop();
				pre_scroll_left = getScrollLeft();
				css.position = "absolute";
				css.margin = 0;
				options.target.css(css);
			} else {
				css.position = "fixed";
			}
					
			fixList.push(this);
			
			return fixList[fixList.length - 1];
		}
	
		function ie6Reset(){
			var cur, options;
			for (var i = 0, l = fixList.length; i < l; i++){
				cur = fixList[i];
				if (cur){
					options = cur.options;
					var  css = {};
					if (options){
						//水平居中
						if (options.left == "auto" && options.right == "auto"){
							css["left"] = getScrollLeft() +  (getVisibleWidth() - options.width) / 2;
						}
						
						//垂直居中
						if (options.top == "auto" && options.bottom == "auto"){
							css["top"] = getScrollTop() +  (getVisibleHeight() - options.height) / 2;
						}
						
						if (typeof options.right === "number"){
							css["right"] = options.right; //- getScrollLeft();

							options.target.css({
								right : getScrollLeft() - pre_scroll_left  + options.right
							});
						}
						
						if (typeof options.left === "number"){
							css["left"] = getScrollLeft() + options.left;
						}
						
						if (typeof options.bottom === "number"){
							//解析ie6 bottom 定位错误的bug
							css["bottom"] = options.bottom;
							if (getVisibleHeight() % 2 == 0){
								if (getScrollTop() % 2 == 1){
									document.documentElement.scrollTop = getScrollTop() + 1;
								}
							} else{
								if (getScrollTop() % 2 == 0){
									document.documentElement.scrollTop = getScrollTop() + 1;
								}
							}

							options.target.css({
								bottom : getScrollTop() - pre_scroll_top  + options.bottom
							});
						}

						if (typeof options.top === "number"){
							css["top"] = getScrollTop() + options.top;
						}
						
						options.target.stop().animate(css,500);
					}
				}
			}
			
			pre_scroll_top = getScrollTop();
			pre_scroll_left = getScrollLeft();
		}
		
		if (ie6){		
			setInterval(function(){
				ie6Reset();
			},800);
		} else {
			
		}
			
		ctor.prototype = {
			remove : function(){
				
			}
		}
			
		ue.fixed = function(options){
			return new ctor(options);
		}
	})();

	ue.dialog = ue.uiDialog = window.uiDialog = function(options){
		return new ctor(options);
	}
	
	uiDialog.list = ctor.list;
	
	(function(){	
		var tmpl 		= '<div class="@{theme}"><div class="ui-dialog-shadow"></div><div class="ui-dialog-custom @{type}"><div class="ui-dialog-custom-inner">@{header}<div class="ui-dialog-body clearfix">@{content}</div>@{footer}</div></div></div>',
			header_tmpl = ' <div class="ui-dialog-header"><a href="#" class="ui-dialog-close_btn"></a><h2>@{title}</h2></div>',
			footer_tmpl = ' <div class="ui-dialog-footer">@{confirm_btn}@{cancel_btn}@{footer}</div>',
			cancel_tmpl = '<a href="#" class="ui-btn ui-btn-s ui-btn-s1 ui-dialog-cancel_btn"><span>取消</span></a>',
			confirm_tmpl = '<a href="#" class="ui-btn ui-btn-s ui-btn-s2 ui-dialog-confirm_btn"><span>确认</span></a>';
			
			
		uiDialog.custom = uiDialog.Custom = function(options){
			var defaults = {
					show_header :  true,
					show_footer : false,
					show_cancel_btn : false,
					show_confirm_btn : false,
					title : '来自4399.com的网页说',
					content : 'hello world',
					type : '',
					footer : '',
					
					theme : 'ui-dialog-a',
					lock : false,
					drag : true,
					dragHock : '.ui-dialog-header',
					confirm : noop,
					cancel : noop,
					icon : '',
					
					init : noop,
					delay : 0
				
				},
				tmpl_options,
				html = '';
			
			options = $.extend(defaults, options);
			
			tmpl_options = {
				header : options.show_header ? template(header_tmpl,options) : '',
				content : !!options.icon ? '<span class="ui-dialog-icon ' + options.icon + '"></span>' + '<div class="ui-dialog-icon-text">' + options.content + "</div>" : options.content,
				footer : options.show_footer ? template(footer_tmpl,{
						footer : options.footer,
						cancel_btn : options.show_cancel_btn ? cancel_tmpl : '',
						confirm_btn : options.show_confirm_btn ? confirm_tmpl : ''
						
					}) : '',
				type : options.type,
				theme : options.theme
			}
			
			options.content = template(tmpl, tmpl_options);
			
			var customInit = options.init;
			
			options.init = function(){
				var _this = this;
				
				options.show_confirm_btn && this.obj.find('.ui-dialog-confirm_btn').bind("click", function(){
					(typeof options.confirm === 'function') && options.confirm.call(_this);
					_this.close();
					return false;
				});
				
				options.show_cancel_btn && this.obj.find('.ui-dialog-cancel_btn').bind("click", function(){
					(typeof options.cancel === 'function') && options.cancel.call(_this);
					_this.close();
					return false;
				});
				
				/*this.obj.find('.ui-dialog-close_btn').bind("click", function(){
					_this.close();
					return false;
				});*/
				
				(options.delay > 0) && this.timer(options.delay, this.close);	
				
				customInit.call(_this);
			}
					
			return uiDialog(options);
			
		}
	
	})();
	
	uiDialog.alert = uiDialog.Alert = function(options){
		var defaults = {
			type : 'ui-dialog-alert',
			theme : 'ui-dialog-a1 ui-dialog-a',
			show_header :  true,
			show_footer : true,
			minWidth : 250,
			maxWidth : 600,
			lock : true,
			show_confirm_btn : true
		}
		
		options = $.extend(defaults, options);
				
		return  uiDialog.Custom(options);
	}

	uiDialog.confirm = uiDialog.Confirm = function(options){
		var defaults = {
			theme : 'ui-dialog-a1 ui-dialog-a',
			type : 'ui-dialog-confirm',
			show_header :  true,
			minWidth : 250,
			maxWidth : 600,
			show_footer : true,
			lock : true,
			show_confirm_btn : true,
			show_cancel_btn : true
		}
		
		options = $.extend(defaults, options);
		
		return uiDialog.Custom(options);
	}
	
	uiDialog.tip = uiDialog.Tip = function(options){
		var defaults = {
			type : 'ui-dialog-tip',
			show_header :  false,
			drag : false,
			delay : 2000
		}
		
		options = $.extend(defaults, options);
		
		return uiDialog.Custom(options);
	}
	
		/**
		options 跟随元素
		isfollowed 被跟随的元素
		pos 跟随元素相对于被跟随元素的位置
		trun {top ,left}微调 
	*/

	var H = {
			LEFT : 1,
			RIGHT : 2,
			CENTER : 4
		},
		V = {
			TOP : 8,
			BOTTOM : 16,
			MIDDLE : 32
		};
		
	function Follow(options, isfollowed, pos, trun){
        var _this,follow;

		//传入jquery对象
		if (typeof options === "object" && options.length > 0){
			follow = options;
		} else if (typeof options === "object"){
			options.left = 0;
			options.right = 0;
			options.lock = false;
			options.position = "absolute";
			follow = (new uiDialog(options)).obj;
		} else {
			return;
		}
		
		var h_pos, v_pos, pos = pos || '';
		var poss = $.trim(pos).toUpperCase().split('_');
		
		for (var i = 0 ; i < poss.length; i++){
			if (H[poss[i]]){
				h_pos = H[poss[i]];
                this._h_pos = poss[i];
			} else if (V[poss[i]]){
				v_pos = V[poss[i]];
                this._v_pos = poss[i];
			}
		}
		
		h_pos = h_pos || H.LEFT;
		v_pos = v_pos || V.TOP;
			
		this.follow = follow;
		this.isfollowed = isfollowed;
		this.h_pos = h_pos;
		this.v_pos = v_pos;
		this.trun = trun;
        this.pos = pos;
		
		this.reset();
		
		Follow.list.push(this);
    }
    
	uiDialog.follow = uiDialog.Follow = function(options, isfollowed, pos, trun){
		return new Follow(options, isfollowed, pos, trun);
	}
	
	Follow.prototype = {
		reset : function(){
			var follow = this.follow,
				isfollowed = this.isfollowed,
                pos = this.pos,
				h_pos = this.h_pos,
				v_pos = this.v_pos,
                _h_pos = this._h_pos,
				_v_pos = this._v_pos,
				trun = this.trun,
				offset = isfollowed.offset() || {left : 0, top : 0},
				trun = trun || {},
				x = trun.x || 0,
				y = trun.y || 0,
				isfollowed_width = isfollowed.outerWidth(),
				isfollowed_height = isfollowed.outerHeight(),
				follow_width = follow.outerWidth(),
				follow_height = follow.outerHeight(),
				left,
				top;

			
			left = offset.left;
			top = offset.top;
			
			switch(h_pos | v_pos){
				case V.TOP | H.LEFT : 
					top -= follow_height;
				break;
				case V.TOP | H.RIGHT: 
					left += isfollowed_width - follow_width;
					top -= follow_height;
				break;
				case V.TOP | H.CENTER: 
					left -= (follow_width - isfollowed_width) / 2;
					top -= follow_height;
				break;
				case V.MIDDLE | H.LEFT : 
					left -= follow_width;
					top -= (follow_height - isfollowed_height) / 2;
				break;
				case V.MIDDLE | H.RIGHT: 
					left += isfollowed_width;
					top -= (follow_height - isfollowed_height) / 2;
				break;
				case V.MIDDLE | H.CENTER: 
					top -= (follow_height - isfollowed_height) / 2;
					left -= (follow_width - isfollowed_width) / 2;
				break;
				case V.BOTTOM | H.LEFT :
					 top += isfollowed_height;
				break;
				case V.BOTTOM | H.RIGHT: 
					top += isfollowed_height;
					left += isfollowed_width - follow_width;
				break;
				case V.BOTTOM | H.CENTER: 
					top += isfollowed_height;
					left -= (follow_width - isfollowed_width) / 2;
				break;
			}
			
			left += x;
			top += y;
			
			if (left < 0){
				left = offset.left;
                _h_pos = "left";
			}
            
			if (left + follow_width > $(document.body).width()){
				left = offset.left + isfollowed_width - follow_width;
                _h_pos = "right";
			}
	
			if (top + follow_height > $(document.body).height()){
				top = offset.top - follow_height;
                _v_pos = "top";
			}
			
			if (top < 0 ){
				top = offset.top + isfollowed_height;
                _v_pos = "bottom";
			}
            
            var cls = [_h_pos, _v_pos].join("_").toLowerCase();
            
			follow.css({"position" : "absolute","left" : left ,"top" : top}).removeClass(this.pre_pos_cls || " ").addClass(cls).show();
            this.pre_pos_cls = cls;
		}
		
	};
	Follow.list = [];
	
	$(window).unbind("resize.follow").bind("resize.follow", function(){
		if (new Date() - last_window_resize_time_follow < 100){
			return false;
		}
		
		last_window_resize_time_follow = new Date();
		
		for (var i = 0; i < Follow.list.length; i++){
			Follow.list[i] && (Follow.list[i].follow.css("display") !== "none") && Follow.list[i].reset();
		}
	});

})(jQuery, window, document);