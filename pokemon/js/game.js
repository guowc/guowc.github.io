;(function(){
    window.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    var $body = $("body"),
        $section = $("#J_section"),
        $catchBall = $("#J_catchBall"),
        $meetBtn = $("#J_meetBtn"),
        $catchBox = $("#J_catchBox"),
        $menuTab = $("#J_menuTab li"),
        $ball = $("#J_ball"),
        $bagBtn =$("#J_bagBtn"),
        $userBtn =$("#J_userBtn"),
        $mask = $('.J_mask'),
        $touchBtn = $(".J_touchBtn"),
        $modal = $('.J_modal'),
        $modalUser = $("#J_modalUser"),
        $pokedexItem = $("#J_pokedexList li"),
        $modalPokedex = $("#J_modalPokedex"),
        $modalAward = $("#J_modalAward"),
        $pageload = $("#J_pageload"),
        $rankBtn = $("#J_rankBtn");

    var updateGlassPokemons = true,
        inNoviceGuide  = false,
        isDraging = false;
    var dragTimer;

    var inCatching = false;

    var Bmap = new BMap.Map("gomap",{enableMapClick:false});
    var point = new BMap.Point(118.186968,24.496273);
    var heroIcon = new BMap.Icon("images/go_role_1.gif", new BMap.Size(40,40),{imageSize: new BMap.Size(40,40)});
    var hero = new BMap.Marker(point,{icon:heroIcon});
    var pokemons = [];
    var pokemons_bag = [];
    var pokemonScroll = new IScroll('#J_pokemonBox', { scrollX: false,scrollbars: true });
    var pokedexScroll = new IScroll('#J_pokedexBox', { scrollX: false,scrollbars: true });

    var heroPoint = hero.getPosition();

    Bmap.setMapStyle({
        styleJson : MAPJSON
    });
    Bmap.disablePinchToZoom();
    Bmap.disableDoubleClickZoom();
    Bmap.centerAndZoom(point,18);
    Bmap.addOverlay(hero);
    hero.setTop(true);

    navigator.geolocation.watchPosition(watchPosition);

    //test
    var geolocation = new BMap.Geolocation();
    function getLocation(){
	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){

            //r.point.lng = 118.186545;
           // r.point.lat = 24.495597;
            // r.point = { lng:118.186545,lat:24.495597}
            if(!isDraging){
                Bmap.panTo(r.point);
            }
            hero.setPosition(r.point);
            heroPoint = r.point;
            if(updateGlassPokemons){
                updateGlassPokemons = false;
                getGlassPokemons(r.point);
                var myGeo = new BMap.Geocoder();
                // 根据坐标得到地址描述
                myGeo.getLocation(heroPoint, function(result){
                    if (result){
                        $("#J_modalUser .city").text(result.address);
                    }
                });
            }
		}
		else {
			alert('failed'+this.getStatus());
		}
	},{enableHighAccuracy: true})
    }
    setInterval(function(){
      getLocation()
   },2000)
    
    //获取授权信息
    fetchJson(API.login,{},function(data){
        var data = data.data;
        $("#J_modalUser .hero").text(data.userName);
        $("#J_modalUser .avatar img").attr('src',data.headImg);
    });
    if(!getCookie('guide')){
        preload(['images/guide/damu.png','images/guide/dialog.png']);
    }

    // if(browser().isIOS){
    //     $pageload[0].addEventListener('animationstart',function(e){
    //         if(e.animationName == 'screenTop'){
    //             if(!getCookie('guide')){
    //                 setCookie('guide',true);
    //                 initGuide();
    //             }else{
    //                 pageReady();
    //             }
    //         }
    //     });
    //     $pageload[0].addEventListener('animationend',function(e){
    //         if(e.animationName == 'screenTop'){
    //             $pageload.remove();
    //         }
    //     });
    // }else{
    //
    // }
    setTimeout(function(){
        if(!getCookie('guide')){
            setCookie('guide',true);
            initGuide();
        }else{
            pageReady();
        }
    },3000);

    function preload(imgArr){
        for(var i= 0 ;i<imgArr.length;i++){
            var _img = new Image();
            _img.src = imgArr[i];
        }
    }
    function pageReady(){
        $section.addClass('pageready');
        getOwnPokemons();
        getRefreshTime();
        refreshBag();
        getNoticeStatus();
        pushMsg();
        setHeroSex(getCookie('sex'));
    }
    function getNoticeStatus(){
        var star = [];
        var flag = false;
        for(var i = 0;i<pokemons.length;i++){
            star.push(pokemons[i].getTitle().split('&')[4]);
        }
        if(star.indexOf('4') !=-1){
            text = '注意！周围出现稀有精灵！';
            flag = true;
        }
        if(star.indexOf('5') !=-1){
            text = '注意！周围出现史诗精灵！';
            flag = true;
        }
        if(flag){
            callNotice(text);
        }
    }
    function watchPosition(position){
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var point_origin = new BMap.Point(lng,lat);
        var point_baidu = [];
        var convertor = new BMap.Convertor();
        point_baidu.push(point_origin);
        convertor.translate(point_baidu, 1, 5, locationCallback);
    }

    function locationCallback(data){
        if(data.status === 0) {
            if(!isDraging){
                Bmap.panTo(data.points[0]);
            }
            hero.setPosition(data.points[0]);
            heroPoint = data.points[0];
            if(updateGlassPokemons){
                updateGlassPokemons = false;
                getGlassPokemons(data.points[0]);
                var myGeo = new BMap.Geocoder();
                // 根据坐标得到地址描述
                myGeo.getLocation(heroPoint, function(result){
                    if (result){
                        $("#J_modalUser .city").text(result.address);
                    }
                });
            }
            walking();
        }
    }
    function walking(){
        var meet = random(0.01);

        if(!inCatching && meet){
            var pokeIndex = Math.floor(Math.random() * 152);
            var star = parseInt(Pokedex[pokeIndex].star);
            if(star>3) return;
            inCatching = true;
            setFollow();
            $("#J_walkwarn").addClass('show');
            setTimeout(function(){
                $("#J_walkwarn").removeClass('show');
                walkPokemon(pokeIndex);
            },2200);
        }
    }
    function walkPokemon(index){
        var data = Pokedex[index];
        $catchBox.find('.texture').attr('src','images/pokemon_big/PM_animation_' + data.number + '.png');
        $catchBox.find('.star').removeClass().addClass('star star_' + data.star);
        $catchBox.find('.pm').text(data.name);
        $catchBox.attr({'data-id':'none','data-pid':data.number,'data-name':data.name,'data-star':data.star});
        $modal.removeClass('show');
        $body.removeClass('blur').addClass('State catching blur');
        inCatching = true;
    }

    function setHeroSex(sex){
        sex = sex || 1;
        hero.setIcon(new BMap.Icon("images/go_role_"+ sex +".gif", new BMap.Size(40,40),{imageSize: new BMap.Size(40,40)}));
        $("#J_userBtn .avatar").removeClass('').addClass('avatar avatar_' + sex);
    }

    function getRefreshTime(){
        fetch(API.getRefreshTime,{},function(data){
            countDown(data.data);
        });
    }

    function countDown(time){
        var $timer = $("#J_timer");
        window.setInterval(function(){
            var minute= 0,
                second= 0;//时间默认值
            if(time > 0){
                minute = Math.floor(time / 60000);
                second = Math.floor(time / 1000 - minute * 60);
            }
            if (minute <= 9 || minute == 0) minute = '0' + minute;
            if (second <= 9 || second == 0) second = '0' + second;
            $timer.text(minute + ':' + second);
            if(time <= 0){
                time = 3600000;
            }
            time -= 1000;
        }, 1000);
    }
    function getGlassPokemons(point){
        fetch(API.getGlassPokemons,{lng:point.lng,lat:point.lat},function(data){
            var data = data.data;
            for(var i = 0; i < data.length; i++){
                addMarker(data[i],i);
            }
        });
    }
    function callNotice(text){
        var tpl = '<div class="Widget notice" id="J_notice"><p class="text">'+ text +'</p></div>';
        if($("#J_notice").length ==0){
            $('body').append(tpl);
        }
        $("#J_notice").addClass('show');
        setTimeout(function(){
            $("#J_notice").removeClass('show');
        },7000);
    }
    function getOwnPokemons(){
        pokemons_bag = [];
        fetch(API.getMyPokemons,{},function(data){
            var pokemonCount = data.data.length;
            for(var i = 0 ;i < pokemonCount;i++){
                pokemons_bag.push(getPid(data.data[i].number));
            }
            setMedal(pokemonCount);
        });
    }
    function setMedal(count){
        $target = $(".J_medal");
        var index = Math.floor(count/15);
        $target.text(MEDAL[index])
    }

    function setFollow(){
        Bmap.panTo(heroPoint);
        hero.setPosition(heroPoint);
        isDraging = false;
    }



    var typeTimer,
        typeOver = false,
        typeIndex = 0;

    function initGuide(){
        var $modalGuide = $("#J_modalGuide"),
            $typeBox = $("#J_typeBox"),
            $setRole = $(".J_setRole"),
            $allModal = $(".J_modal"),
            $setPoke = $(".J_setFirstPoke"),
            $setFigure = $("#J_setFirstFigure"),
            $body = $('body');
        var sex = 1;
        var pokenum = '001';
        inNoviceGuide = true;
        $allModal.removeClass('show');
        $modalGuide.addClass('show');
        $body.addClass('blur');
        setCookie('sex',sex);
        $setPoke.bind('tap',function(){
            pokenum = $(this).data('number');
            $(this).addClass('selected').siblings().removeClass('selected');
            $setFigure.attr('src','images/pokemon_big/PM_animation_'+ pokenum + '.png');
        });
        $setRole.bind('tap',function(){
            sex = $(this).data('sex');
            $(this).addClass('selected').siblings().removeClass('selected');
        });
        typing('欢迎来到精灵世界/我是大木博士',10);
        $typeBox.bind('tap',function(){
            if(!typeOver) return;
            typeIndex ++;
            switch (typeIndex) {
                case 1:
                    typing('这个世界到处都有精灵的存在/许多人把精灵当做伙伴',0);
                    break;
                case 2:
                    typing('那么你是男孩还是女孩？/(选择角色)',0);
                    $modalGuide.addClass('setrole');
                    break;
                case 3:
                    typing('选择一只精灵作为你的伙伴吧/(选择精灵)',0);
                    $modalGuide.removeClass('setrole').addClass('setpoke');
                    if(sex == 0){
                        setHeroSex(0);
                    }
                    setCookie('sex',sex);
                    break;
                case 4:
                    typing('点击周围的小精灵即可抓捕!/(操作方式)',0);
                    $modalGuide.removeClass('setpoke');
                    givePokemon(pokenum);
                    break;
                case 5:
                    typing('移动可能遇到随机出现的稀有精灵哦!/(随机事件)',0);
                    break;
                case 6:
                    typing('请带上你的伙伴去冒险吧!',0);
                    break;
                case 7:
                    $modalGuide.removeClass('show');
                    $body.removeClass('blur');
                    inNoviceGuide = false;
                    pageReady();
                    break;
                default:
            }
        });
    }
    function typing(char,time){
        var $target = $("#J_typeText"),
            $typeNext = $("#J_typeNext");
        var chars = char.split('');
        var index = 0,
            delay = 0;
        $target.html('');
        $typeNext.hide();
        typeOver = false;
        typeTimer = setInterval(function(){
            if(delay == time){
                if(index == chars.length){
                    clearInterval(typeTimer);
                    typeOver = true;
                    $typeNext.show();
                    return;
                }
                if(chars[index] == '/'){
                    $target.append('<br>');
                }else{
                    $target.append(chars[index]);
                }
                index ++;
            }else{
                delay ++ ;
            }
        },50);
    }

    function catchPokemon(id){
        fetch(API.catchPokemon,{id:id},function(){
            getOwnPokemons();
        });
    }
    function givePokemon(pid){
        fetch(API.catchPokemon,{number:pid},function(){
            getOwnPokemons();
        });
    }
    function escapePokemon(id,flag){
        fetch(API.catchPokemon,{id:id,fail:flag},function(){
            console.log('捕捉失败！精灵逃跑了！');
        });
    }

    function fetch(url,param,callback){
        var cbk = callback || function(){};
        $.ajax({
            url : url,
            dataType : 'jsonp',
            data : param,
            success:function(data){
                cbk(data);
            }
        })
    }

    function fetchJson(url,param,callback){
        var cbk = callback || function(){};
        $.ajax({
            url : url,
            dataType : 'json',
            data : param,
            success:function(data){
                cbk(data);
            }
        })
    }


    function initPokecard(pokedexIndex,glassIndex){
        var $target = $("#J_modalPokedex");
        var $distTips = $("#J_distTips");
        var $dist = $("#J_dist");
        var prop = Pokedex[pokedexIndex];
        var propItemTpl = '';
        var dist = 0;

        for(var i = 0; i< prop.properties.length; i++){
            var colorArr = Pokedexcolor[prop.properties[i]].split(',');
            propItemTpl += '<div class="item" style="background:'+ colorArr[1] +';border-color:'+ colorArr[0] +'">'+ prop.properties[i] +'</div>';
        }
        if(glassIndex) {
            dist = Bmap.getDistance(heroPoint,pokemons[glassIndex].getPosition()).toFixed(0);
            $target.addClass('catch');
            $meetBtn.data('glassindex',glassIndex);
            if(dist < 500){
                $distTips.hide();
                if(pokemons_bag.indexOf(prop.number) != -1){
                    $meetBtn.removeClass().addClass('ownbtn').data('glassindex','').text('已获得');
                }else{
                    $meetBtn.removeClass().addClass('meetbtn').data('glassindex',glassIndex).text('捕捉');
                }
            }else{
                $dist.text(dist);
                $distTips.show();
                $meetBtn.removeClass().addClass('overbtn').data('glassindex','').text('走近点啊亲');
            }
        }else{
            $target.removeClass('catch');
            $distTips.hide();
        }
        $modalPokedex.addClass('show');
        $target.find('.name_cn').text(prop.name);
        $target.find('.name_jp').text(prop.name_jp + prop.name_en);
        $target.find('.star').removeClass().addClass('star star_' + prop.star);
        $target.find('.num').text('No.' + prop.number);
        $target.find('.prop').html(propItemTpl);
        $("#J_pokebox").removeClass('loaded');
        loadImg('images/pokemon_big/PM_animation_'+ prop.number +'.png',function(){
            $target.find('.pokeimg').attr('src','images/pokemon_big/PM_animation_'+ prop.number +'.png');
            $("#J_pokebox").addClass('loaded');
        });
    }

    function showModal(target){
        var target = $("#" + target);
        var body = $("body");
        target.addClass('show');
        body.addClass('blur');
    }
    function hideModal(){
        var body = $("body");
        $modal.removeClass('show');
        body.removeClass('blur');
    }
    function getPid(pid){
        if(parseInt(pid) < 10){
            return '00'+pid;
        }else if(parseInt(pid) >= 10 && parseInt(pid) < 100){
            return '0'+pid;
        }else{
            return pid;
        }
    }
    function addMarker(pokemon,index){
        var id = pokemon.id;
        var pid = getPid(pokemon.number);
        var pdx = parseInt(pid) - 1;
        var point = new BMap.Point(pokemon.position_x,pokemon.position_y);
    	var icon = new BMap.Icon("images/pokemon/PM_icon_"+ pid +".png", new BMap.Size(40,40),{imageSize: new BMap.Size(40,40)});
    	var marker = new BMap.Marker( point,{icon:icon} );
        var name = Pokedex[pdx].name;
        var star = Pokedex[pdx].star;
        marker.setTitle(id + '&' + pid + '&' + index + '&' + name + '&' + star) ;
    	Bmap.addOverlay(marker);
        pokemons.push(marker);
        marker.addEventListener('click',clickMarker);
    }
    function clickMarker(e){
        var title = e.target.getTitle().split('&');
        console.log(title);
        var pokedexIndex = parseInt(title[1])-1;
        var glassIndex = title[2];
        initPokecard(pokedexIndex,glassIndex);
    }

    function awardBox(img,name,callback){
        var cbk = callback || {};
        $modalAward.addClass('show');
        $modalAward.find('.img').attr('src',img);
        $modalAward.find('.pname').text(name);
        $modalAward.find('.confirm').bind('tap',function(){
            $modalAward.removeClass('show');
            cbk();
        });
    }
    function alertBox(title,callback){
        var cbk = callback || {};
        var $alert = $("#J_alert");
        $alert.addClass('show');
        $alert.find('.heading').text(title);
        $alert.find('.confirm').bind('tap',function(){
            $alert.removeClass('show');
            cbk();
        });
    }
    function refreshBag(){
        var $pokemon = $("#J_pokemonList"),
            $pokedex = $("#J_pokedexList"),
            $pokemonItem = $pokemon.find('li'),
            $probar = $("#J_progress .probar"),
            $protxt = $("#J_progress .protxt");

        fetch(API.getMyPokemons,{},function(data){
            if(data.status){
                var data = data.data,
                    tpl = '',
                    pokemonNum = data.length,
                    pokedexNum = Pokedex.length,
                    percent = parseInt(pokemonNum/pokedexNum*100);

                $protxt.text(pokemonNum +'/'+ pokedexNum);
                $probar.css('width',percent + '%');
                if(pokemonNum == $pokemonItem.length) return;
                for(var i = 0;i < data.length; i++){
                    var pid = getPid(data[i].id);
                    tpl += '<li><img src="images/pokemon/PM_icon_'+ pid +'.png"></li>';
                    $pokedex.find('[data-number="'+ pid +'"]').addClass('get');
                }
                $pokemon.html(tpl);
                if(data.length == 0){
                    $("#J_pokemonBox .load").text('还没有抓到任何精灵!');
                }else{
                    $("#J_pokemonBox .load").hide();
                }
                pokemonScroll.refresh();
            }
        });
    };

    // setTimeout(function(){
    //     meetPokemon(4);
    // },2000);
    var rankload = false;
    var rankScroll;
    function getRank(){
        if(!rankload){
            $("#J_rankLoad").show();
            fetch(API.getRank,{},function(data){
                var data = data.data;
                var tpl = '';
                rankload = true;
                for(var i=0;i<50;i++){
                    tpl += '<li>\
                        <span class="num">'+ (i+1) +'</span>\
                        <div class="user">\
                            <img src="'+ data[i].headImg +'" alt="avatar">\
                            <span class="uid">'+ data[i].userName +'</span>\
                        </div>\
                        <span class="star">'+ data[i].starNum +' 星</span>\
                    </li>';
                }
                $("#J_rankList").html(tpl);
                $("#J_rankLoad").hide();
                rankScroll = new IScroll('#J_rankBox', { scrollX: false,scrollbars: true });
            });
        }
    }
    function meetPokemon(glassIndex){
        var data = pokemons[glassIndex].getTitle().split('&');
        $catchBox.find('.texture').attr('src','images/pokemon_big/PM_animation_' + data[1] + '.png');
        $catchBox.find('.pm').text(data[3]);
        $catchBox.find('.star').removeClass().addClass('star star_' + data[4]);
        $catchBox.attr({'data-id':data[0],'data-pid':data[1],'data-name':data[3],'data-star':data[4]});
        $modal.removeClass('show');
        $body.removeClass('blur').addClass('State catching blur');
        Bmap.removeOverlay(pokemons[glassIndex]);
        inCatching = true;
        // pokemons.splice(glassIndex,1);
    }
    function random(x){
        return Math.random() < x ;
    }

    var pokedexPage = 1,
        pokedexInit = false;
        pokedexLoaded = false;
    function initPokedex(){
        if(pokedexInit) return;
        loadPokedex(0,14);
        pokedexInit = true;
    }

    function loadPokedex(index,len){
        var $pokedex = $("#J_pokedexList"),
            $pokedexItem = $("#J_pokedexList li"),
            tpl = '';
        for(var i = index*15;i <= (index*15 + len); i++){
            var pnum = Pokedex[i].number;
            var cls = '';
            if(pokemons_bag.indexOf(pnum)!=-1){
                cls = 'get';
            }else{
                cls = '';
            }
            tpl +='<li class="'+ cls +'" data-index="'+ i +'" data-number="'+ Pokedex[i].number +'">\
                <div class="card">\
                    <div class="mons">\
                        <img src="images/pokemon/PM_icon_'+ Pokedex[i].number +'.png" alt="">\
                    </div>\
                    <p class="num">No.'+ Pokedex[i].number +'</p>\
                    <p class="name">'+ Pokedex[i].name +'</p>\
                </div>\
            </li>';
        }
        $pokedex.append(tpl);
        pokedexScroll.refresh();
    }
    pokedexScroll.on('scrollEnd',function(){
        var dis = this.y - this.maxScrollY;
        if(dis < 300 && !pokedexLoaded){
            if(pokedexPage == 9){
                loadPokedex(pokedexPage,15);
                pokedexLoaded = true;
            }else{
                loadPokedex(pokedexPage,14);
                pokedexPage++;
            }
        }
    })
    //pushmsg
    var pushTexts = [
        '点击右上角[···]-[收藏]，方便回来哦~',
        '欢迎来到精灵世界~',
        '点击周围的精灵开始抓捕吧~',
        '所有训练师同在一个精灵世界哦~',
        '精灵每隔一小时刷新一次',
        '移动中有几率遇到稀有精灵~',
        '精灵星级越高，捕捉难度越大',
        '下手慢了可能被附近的训练师抓走哦!',
        '快来完成图鉴，解锁新成就~',
        '超越小伙伴，挑战精灵大师榜~',
    ]
    var pushTimer;
    var index = 0;
    function pushMsg(){
        if(getCookie('hideMsg')!='true'){

        }
        pushTimer = setInterval(function(){
            var len = pushTexts.length;
            var flag = $(".Modal.show").length;
            if(flag == 0){
                var text = pushTexts[index];
                index ++ ;
                index = index==len?0:index;
                showMsg(text);
            }
        },8000);
        $('#J_pushMsg .close').bind('tap',function(){
            setCookie('hideMsg','true');
            clearInterval(pushTimer);
            $('#J_pushMsg').removeClass('show');
        });
    }
    function showMsg(text){
        $('#J_pushMsg .text').text(text);
        $('#J_pushMsg').addClass('show');
        setTimeout(function(){
            $('#J_pushMsg').removeClass('show');
        },3500);
    }

    //toast
    var toastShow = false;
    function callToast(type,text,delay,time,once){
        var $target = $("body");
        if(toastShow) return;
        toastShow = true;
        switch (type) {
            case 1:
                var tpl = '<div class="Widget toast toast-ball" id="J_toast"><p class="text">' + text + '</p></div>'
                break;
            default:
        }
        if($("#J_toast").length == 0){
            $target.append(tpl);
        }
        setTimeout(function(){
            $("#J_toast").addClass('show');
            setTimeout(function(){
                $("#J_toast").removeClass('show');
                if(!once){
                    toastShow = false;
                }
            },time);
        },delay);
    }
    function loadImg(img,callback){
        var cbk = callback || {};
        var image = new Image();
        image.src = img;
        image.onload = function(){
            cbk();
        }
    }
    function browser(){
        var UA = window.navigator.userAgent.toLowerCase();
        return {
            isWeixin:UA.match(/MicroMessenger/gi) == 'micromessenger' ? true:false,
            isIOS:/(iPhone|iPad|iPod|iOS)/gi.test(UA),
            isAndroid:/android|adr/gi.test(UA),
            isMobile:/(iPhone|iPad|iPod|iOS|Android|adr|Windows Phone|SymbianOS)/gi.test(UA),
        }
    }
    function getCookie(name){
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) return decodeURIComponent(arr[2]);
        return null;
    }
    function setCookie(name, value,timer) {
        var Days = timer || 30;//默认30天
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + exp.toUTCString();
    }

    $rankBtn.bind('tap',function(){
        getRank();
        showModal('J_modalRank');
        if(rankScroll){
            rankScroll.scrollTo(0,0);
        }
    }).bind('touchend',function(e){
        e.preventDefault();
    });

    $ball.bind('tap',function(){
        toastShow = isDraging;
        callToast(1,'拖拽地图后，点击精灵球回到当前位置哦',0,3000,false);
        setFollow();
    });

    $touchBtn.bind('touchstart',function(){
        $(this).addClass('touch');
    }).bind('touchend',function(){
        $(this).removeClass('touch')
    });
    $meetBtn.live('tap',function(){
        var glassIndex = $(this).data('glassindex');
        if(glassIndex){
            meetPokemon(glassIndex);
        }
    });
    $catchBall.bind('tap',function(){
        var name = $catchBox.data('name');
        var id = $catchBox.data('id');
        var pid = $catchBox.data('pid');
        var pstar = parseInt($catchBox.data('star'));
        var star = 0.8 -  pstar / 10;
        star = pstar==5?0.05:star;
        if(random(star)){
            if(id == "none"){
                givePokemon(pid)
            }else{
                catchPokemon(id);
            }
            $catchBox.addClass('catchwin');
            $(this)[0].addEventListener('animationend',function(e){
                if(e.animationName == 'catchwin'){

                }
            });
            setTimeout(function(){
                awardBox('images/pokemon_big/PM_animation_' + pid + '.png',name,function(){
                    $body.removeClass('catching blur');
                    $catchBox.removeClass('catchwin');
                    inCatching = false;
                });
            },3200);
        }else{
            if(id != "none"){
                escapePokemon(id,true);
            }
            $catchBox.addClass('catchfail');
            $('#J_catchTexture')[0].addEventListener('animationend',function(e){
                if(e.animationName == 'catchrun'){

                }
            });
            setTimeout(function(){
                alertBox(name + ' 逃跑了!',function(){
                    $body.removeClass('catching blur');
                    $catchBox.removeClass('catchfail');
                    inCatching = false;
                });
            },1500);
        }
    });
    $menuTab.bind('tap',function(){
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass();
        $('.J_bagBox').eq(index).show().siblings('.J_bagBox').hide();
        pokemonScroll.refresh();
        pokedexScroll.refresh();
    }).bind('touchend',function(e){
        e.preventDefault();
    });
    $bagBtn.bind('tap',function(){
        showModal('J_modalBag');
        initPokedex();
        refreshBag();
    });
    $userBtn.bind('tap',function(){
        showModal('J_modalUser');
    });
    $modalUser.bind('tap',function(){
        hideModal();
    });
    $mask.bind('tap',function(){
        hideModal();
    });
    $pokedexItem.live('touchstart',function(){
        $(this).addClass('touch');
    }).live('touchend',function(){
        $(this).removeClass('touch');
    }).live('tap',function(){
        var index = $(this).data('index');
        initPokecard(index);
    });
    $modalPokedex.bind('touchend',function(e){
        $(this).removeClass('show');
        e.preventDefault();
    });

    Bmap.addEventListener('touchmove',function(){
        callToast(1,'拖拽地图后，点击精灵球回到当前位置哦',0,3000,true);
        isDraging = true;
    });
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function(event){
        var dir =  event.webkitCompassHeading,
            nor = 360 - dir;
        $("#J_pin").css("-webkit-transform",'rotate('+nor+'deg)');
      }, false);
    }
})();