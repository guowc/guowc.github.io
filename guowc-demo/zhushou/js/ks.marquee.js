;(function(factory) {
	// CMD/SeaJS
	if(typeof define === "function") {
		define(factory);
	}
	// No module loader
	else {
		factory('', window['ue']={}, '');
	}

}(function(require, exports, module) {

	function fixMousewheel(e){
			var delta = 0, deltaX = 0, deltaY = 0
			// Old school scrollwheel delta
			if ( e.wheelDelta ) { delta = e.wheelDelta/120; }
			if ( e.detail     ) { delta = -e.detail/3; }
			
			// New school multidimensional scroll (touchpads) deltas
			deltaY = delta;
			
			// Gecko
			if ( e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS ) {
				deltaY = 0;
				deltaX = -1*delta;
			}
			
			// Webkit
			if ( e.wheelDeltaY !== undefined ) { deltaY = e.wheelDeltaY/120; }
			if ( e.wheelDeltaX !== undefined ) { deltaX = -1*e.wheelDeltaX/120; }
			
			return {delta : delta, deltaX : deltaX, deltaY : deltaY}
		}

		function ctor(options){
			var defaults = {
					scrolltarget : "",//绑定滚轮切换的对象
					hovertarget : "",//鼠标hover停止切换的对象
					target : "",//滚动对象 一般为 ul
					items : "", //滚动的详细列表
					gotobtn : "",//指定滚动位置的按钮
					gotobtn_activable : true,//是否可以点击
					gotobtn_currentclass : "cur",//
					prevbtn : "",//向前或者 向上按钮
					prevbtndisabled : "prevbtndisabled",
					nextbtn : "",//向后或者 向下按钮
					nextbtndisabled : "nextbtndisabled",

					delay : 3000,//切换间隔时间
					speed : 600,//切换速度
					visiblenum : 1,//可见个数
					scrollnum : 1,//一次滚动几个
					autoplay : true,//是否自动播放
					currentclass : "",
					fade : 0,//是否渐隐渐现
					trigger : "click",
					loop : 1,//循环模式 1 无限循环 0 不循环
					afterSlide : function(){},//每滚动一个完的回调函数
					beforeSlide : function(){},//每滚动一个之前的回调函数
					beforePrev : function(){},
					afterPrev : function(){},
					beforeNext : function(){},
					afterNext : function(){},
					onTop : function(){},
					onBottom : function(){},
					mode : 0,//0表示竖直方向滚动 1 表示水平方向滚动
					direction : 0//表示默认的滚动方向0向上或者向左 1表示向下或者向右
				};
				
			options = this.options = $.extend(defaults, options);
			
			this.scrolltarget = $(options.scrolltarget);
			this.hovertarget = $(options.hovertarget);
			this.target = $(options.target);
			this.prevbtn = $(options.prevbtn);
			this.nextbtn = $(options.nextbtn);
			this.gotobtn = $(options.gotobtn);
			this.items = $(options.items);
			
		if(this.prevbtn.length == 0){
			this.prevbtn = $("<div>");
		}

		if(this.nextbtn.length == 0){
			this.nextbtn = $("<div>");
		}
			this.items.each(function(i, v){
				$(this).attr("data-index", i);
			});

			if (options.loop == 1){	
				//要实现一次滚动多个，项目个数至少是滚动个数的2倍
				if ((this.items.length - options.visiblenum) < options.scrollnum *2 ){
					if (this.items.length > options.visiblenum){
						this.target.append($(options.items).clone());
					} else {
						if (options.prevbtndisabled == ""){
							this.prevbtn.css("visibility", "hidden");
						} else {
							this.prevbtn.addClass(options.prevbtndisabled);
						}

						if (options.nextbtndisabled == ""){
							this.nextbtn.css("visibility", "hidden");
						} else {
							this.nextbtn.addClass(options.nextbtndisabled);
						}
					}

					this.items = $(options.items);
				}
			} else {
				if(this.items.length <= options.visiblenum){
					options.autoplay = false;
				}

				if (options.prevbtndisabled == ""){
					this.prevbtn.css("visibility", "hidden");
				} else {
					this.prevbtn.addClass(options.prevbtndisabled);
				}

				if (this.items.length <= options.visiblenum){
					if (options.nextbtndisabled == ""){
						this.nextbtn.css("visibility", "hidden");
					} else {
						this.nextbtn.addClass(options.nextbtndisabled);
					}
					//return;
				} else {
					if (options.nextbtndisabled == ""){
						this.nextbtn.css("visibility", "visible");
					} else {
						this.nextbtn.removeClass(options.nextbtndisabled);
					}
				}
			}
					
			this.gotobtn.each(function(i, v){
				if (typeof $(this).attr("data-index") === "undefined"){
					$(this).attr("data-index", i);
				}
			});
			
			//水平方向
			if (options.mode == 1){
				this.target.css({
					width : this.items.length * this.items.outerWidth(true)
				})
			}

			this.current = this.items.eq(0);
			this.current.addClass(options.currentclass).siblings().removeClass(options.currentclass);
			this.bind();
			this.start();
		}
		
		ctor.prototype = {
			bind : function(){
				var options = this.options,
					_this = this;
				
			this.prevbtn.bind(options.trigger, function(){
					if (options.prevbtndisabled != "" && $(this).hasClass(options.prevbtndisabled)){
						options.onTop.call(_this);
						return false;
					}
					_this.prev();
					return false;
				});
				
			this.nextbtn.bind(options.trigger, function(){
					if (options.nextbtndisabled != "" && $(this).hasClass(options.nextbtndisabled)){
						options.onBottom.call(_this);
						return false;
					}
					_this.next();
					return false;
				});
				
				if(options.gotobtn_activable){
					this.gotobtn.bind(options.trigger, function(){
						var index = $(this).attr("data-index"),
							preindex = _this.current.attr("data-index");
						
						//往后面的指定位置滚动
						if (preindex < 0) preindex  = 0;
						_this.goto(index, preindex);
						return false;
					});
				}

				this.scrolltarget.bind("mousewheel DOMMouseScroll", function(e){
					if (_this.animate) return false;
					var evt = fixMousewheel(e);
					
					if(evt.delta > 0){
						_this.prevbtn.trigger("click");
					} else {
						_this.nextbtn.trigger("click");
					}
					
					e.preventDefault();
					e.stopPropagation();
					
					return false;
				});
				
			this.hovertarget.bind("mouseover mouseout", function(evt){
				_this.handleHover(evt);	
			});

			options.hovergotobtn && this.gotobtn.bind("mouseover mouseout", function(evt){
				if($(this).hasClass(options.gotobtn_currentclass)){
					_this.handleHover(evt);	
				}
			});
		},
		
		handleHover : function(evt){
			var _this = this;
			
			if (evt.type == "mouseover"){
				_this.hoverstatus = true;
				setTimeout(function(){
					_this.checkHover();
				},300);
			} else if (evt.type == "mouseout"){
				_this.hoverstatus = false;
				setTimeout(function(){
					_this.checkHover();
				},300);
			}
		},
			
			next : function(){
				if (this.animate) return false;
				this.scroll(0);
			},
			
			prev : function(){
				if (this.animate) return false;
				this.scroll(1);
			},
			
			goto : function(index, preindex){
				if (this.animate) return false;
				
				if (index > preindex){
					this.scroll(0, index - preindex);
				} else if (index < preindex){//往前面的指定位置滚动
					this.scroll(1, preindex - index);
				}
			},
			
			scroll : function(direction, scrollnum){
				var _this = this,
					options = this.options,
					current,
					distance,
					move_type,
					index,
					args = {},
					scrollnum = (typeof scrollnum === "number") ? scrollnum : options.scrollnum;
					direction = (typeof direction === "number") ?  direction : options.direction;
				
				_this.items = $(options.items);

				this.animate = true;
				this.stop();
				this.target.stop();
				
				//往后面翻页
				if (direction == 0){
					//console.log(options.visiblenum , scrollnum , parseInt(_this.items.eq(0).attr("data-index")) , _this.items.length);
					if(options.loop == 0 && options.visiblenum + scrollnum + parseInt(_this.items.eq(0).attr("data-index")) > _this.items.length){
						scrollnum = _this.items.length - options.visiblenum - _this.items.eq(0).attr("data-index");
					} 
					
					//console.log(scrollnum);
					current = _this.items.slice(0, scrollnum);

					if (options.mode == 0){
						distance = current.outerHeight(true);
						move_type = "margin-top";
						args = {"margin-top" : - distance * scrollnum};
						
					} else {
						distance = current.outerWidth(true);
						//console.log(distance);
						move_type = "margin-left";
						args = {"margin-left" : - distance * scrollnum};
					}

					_this.current = _this.items.eq(scrollnum);
					index = _this.current.attr("data-index");
					_this.gotobtn.eq(index).addClass(options.gotobtn_currentclass).siblings().removeClass(options.gotobtn_currentclass);
					_this.current.addClass(options.currentclass).siblings().removeClass(options.currentclass);
					options.beforeNext.call(_this);
					options.beforeSlide.call(_this);
					
					if (options.loop == 0){
						//console.log(_this.items.eq(0).attr("data-index") , _this.items.length - options.visiblenum , scrollnum);
						if(parseInt(_this.items.eq(0).attr("data-index")) + scrollnum == _this.items.length - options.visiblenum){
							if (options.nextbtndisabled == ""){
								_this.nextbtn.css("visibility", "hidden");
							} else {
								_this.nextbtn.addClass(options.nextbtndisabled);
							}
						} else{
							if (options.nextbtndisabled == ""){
								_this.nextbtn.css("visibility", "visible");
							} else {
								_this.nextbtn.removeClass(options.nextbtndisabled);
							}
						} 

						if (options.prevbtndisabled == ""){
							this.prevbtn.css("visibility", "visible");
						} else {
							this.prevbtn.removeClass(options.prevbtndisabled);
						}
					}
					
					_this.target.animate(args, options.speed, function(){
						
						_this.target.css(move_type, 0);
						_this.target.append(current);
						_this.items = $(options.items);
						setTimeout(function(){
							options.afterNext.call(_this);
							options.afterSlide.call(_this);
						},0);
						_this.animate = false;
						
						setTimeout(function(){
							_this.start()
						}, 0);
			
					});
				
				//向前面翻页
				} else {

					if(options.loop == 0 && options.visiblenum + scrollnum > _this.items.length){
						scrollnum = _this.items.length - options.visiblenum;
					} 

					current = _this.items.slice(-scrollnum);
					
					if (options.mode == 0){
						distance = current.outerHeight(true);
						move_type = "margin-top";
						args = {"margin-top" : 0};
						
					} else {
						distance = current.outerWidth(true);
						move_type = "margin-left";
						args = {"margin-left" : 0};
					}
					
					_this.current = _this.items.eq(_this.items.length - scrollnum);
					index = _this.current.attr("data-index");
					_this.gotobtn.eq(index).addClass(options.gotobtn_currentclass).siblings().removeClass(options.gotobtn_currentclass);
					_this.current.addClass(options.currentclass).siblings().removeClass(options.currentclass);
					_this.target.prepend(current);
					_this.items = $(options.items);
					setTimeout(function(){
						options.beforePrev.call(_this);
						options.beforeSlide.call(_this);
					},0);

					if (options.loop == 0){

						if(this.items.eq(0).attr("data-index") == 0){
							if (options.prevbtndisabled == ""){
								this.prevbtn.css("visibility", "hidden");
							} else {
								this.prevbtn.addClass(options.prevbtndisabled);
							}
						} else {
							if (options.prevbtndisabled == ""){
								this.prevbtn.css("visibility", "visible");
							} else {
								this.prevbtn.removeClass(options.prevbtndisabled);
							}
						}

						if (options.nextbtndisabled == ""){
							_this.nextbtn.css("visibility", "visible");
						} else {
							_this.nextbtn.removeClass(options.nextbtndisabled);
						}
					}
					
					_this.target.css(move_type , - distance * scrollnum).animate(args, options.speed, function(){
						options.afterPrev.call(_this);
						options.afterSlide.call(_this);
						_this.animate = false;
						
						setTimeout(function(){
							_this.start()
						}, options.delay);
					});
				}
			},
			
			stop : function(){
				clearInterval(this.timer);
			},
			
			start : function(){
				var options = this.options,
					_this = this;
				
				if (!options.autoplay){
					return;
				}
			if(this.hoverstatus){
				return;
			}
				this.stop();
				this.timer = setInterval(function(){
					_this.scroll();
				}, options.delay + options.speed);
			},
			
			checkHover : function(){
				if (this.hoverstatus){
					this.stop();
				} else {
					this.start();
				}
			}
		}
		
		

		if( {}.toString.call(module) == '[object Object]' ){
	    	module.exports = function(options){
				return new ctor(options);
			};
		}else{
			exports.marquee =  function(options){
				return new ctor(options);
			};
		}
		
}));