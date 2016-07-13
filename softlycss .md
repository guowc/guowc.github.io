softlyCSS-大型CSS结构化设计
====================

CSS基础规范
-------

· 不使用分割符作为作用域写法

    .mod-slide{}

· 不使用分隔符作为单词拼接写法

	.header-nav-list{}

· 不混用分隔符拼接

	.header_nav-list{}
	
· 顶级class不使用单独单词命名

	.search .ooxx{}
	
· class嵌套层数不超过3层

	.search .ooxx .ooxx .ooxx{}
	
· 不使用任何标签选择符

	.card .head a{}
	.card .head span{}
	.card .head .more{} //推荐

· 使用中划线分隔符作为同类型模块拓展

	.Module.vote{}
	.Module.vote-simple{}
	.Icon.home{}
	.Icon.home-lg{}

· 命名尽量不与业务相关

	.List.goods{ }   //不推荐
	.List.thumb{}    //推荐
	.List.news{}     //不推荐
	.List.text{}     //推荐
	

HTML基础规范
--------

· 减少DOM结构嵌套层级
· 不使用原子类

	<div class="box fl mt10 relative clearfix"></div>
· 兄弟结构权重接近

	<!--不推荐-->
	<div class="Module article"></div>    
	<span class="loadmore"></span>
	
	<!--推荐-->
	<div class="Module article"></div>   
	<div class="Module loadmore">
		<span class="loadmore"></span>
	</div> 

定义基础类
-----

· 基础类以大写字母开头

	.Frame  [ 框架类 ]
	.Widget [ 组件类 ]
	.Module [ 模块类 ]
	.View   [ 视图类 ]
	.List   [ 列表类 ]
	.Modal  [ 模态类 ]
	.Input  [ 控件类 ]
	.Icon   [ 图标类 ]
	.Image  [ 图片类 ]
	
· 通过基础类链接class名约束作用域

	.Frame.search{
		/* 框架级搜索框 */
	}
	.Module.search{
		/* 业务级搜索框 */
	}
	.Modal.search{
		/* 模态搜索框 */
	}
	.List.search{
		/* 搜索列表 */
	}

文件目录
--------

    -assets/
	    -css
		  -lib
		    normalize.scss
			functions.scss
			aniamtion.scss
			reset.scss
			vars.scss
		  -view
			frame.scss
			widget.scss
			module.scss
			view.scss
			list.scss
			modal.scss
			input.scss
			icon.scss
	    -js/
	    -images/
	-dist/
		-css/
			dist.min.css
		-js
		-images/


基础类实例化示例
--------
注：以下使用scss语法

	.Frame {
		&.header{}
		&.footer{}
		&.tabbar{}
		&.menu{}
		&.sidemenu{}
		&.navigator{}
	}
	
	.Widget {
		&.swipe{}
		&.dropdown{}
		&.toggle{}
		&.progress{}
		&.tabs{}
		&.datepicker{}
		&.paging{}
		&.loadmore{}
		&.backtop{}
		&.share{}
		&.scrollbar{}
		&.marquee{}
		&.slide{}
		&.stars{}
		&.praise{}
	}
	
	.Module {
		&.category{}
		&.article{}
		&.search{}
		&.comment{}
		&.vote{}
		&.feedback{}
		&.video{}
		&.rank{}
		&.meta{}
		&.topic{}
		&.setting{}
		&.service{}
		&.product{}
	}
	.View {
		&.section{}
		&.box{}
		&.card{}
		&.panel{}
		&.grid{}
		&.row{}
		&.col{}
	}
	.List {
		&.text{}
		&.img{}
		&.imgtext{}
		&.graphic{}
		&.thumb{}
		&.option{}
		&.media{}
		&.gallery{}
		&.link{}
		&.card{}
		&.goods{}
		&.category{}
		&.fittings{}
	}
	.Modal {
		&.dialog{}
		&.alert{}
		&.tooltip{}
		&.loading{}
		&.mask{}
		&.toast{}
		&.upload{}
		&.notice{}
	}
	.Input {
		&.text{}
		&.select{}
		&.search{}
		&.check{}
		&.radio{}
		&.date{}
		&.select{}
		&.textarea{}
	}
	.Button {
		&.cancel{}
		&.confirm{}
		&.submit{}
		&.close{}
		&.remove{}
		&.disable{}
		&.default{}
		&.primary{}
		&.danger{}
		&.warning{}
		&.success{}
		&.upload{}
		&.blue{}
		&.green{}
	}
	.Icon {
		&.sprite{}
		&.sprite-16{}
		&.sprite-16.home{}
		&.sprite-32{}
		&.sprite-32.home{}
		&.back{}
		&.cart{}
		&.user{}
		&.key{}
		&.star{}
		&.setting{}
	}

## html ##

	<!--[Frame] header-->
	<div class="Frame header">
	    <!--[Widget] header-->
	    <div class="Widget dropdown"></div>
	</div>
	<!--[View] section-->
	<div class="View section">
	    <!--[View] card-->
	    <div class="View card">
	        <div class="head">
	            <h2 class="title">标题</h2>
	            <span class="more">更多</span>
	        </div>
	        <div class="body">
	            <!--[Module] goods-->
	            <div class="Module goods">
	                <!--[List] graphic-->
	                <ul class="List graphic">
	                    <li class="item">
	                        <img class="figure" src="" alt="">
	                        <h3 class="title"></h3>
	                        <p class="text"></p>
	                    </li>
	                </ul>
	            </div>
	        </div>
	    </div>
	</div>