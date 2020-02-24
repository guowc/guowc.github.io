
console.log("%c______    _____   ______ ", 'color:#ddd')
console.log("%c| ___ \\  |_   _|  | ___ \\", 'color:#ddd')
console.log("%c| |_/ /    | |    | |_/ /", 'color:#ddd')
console.log("%c|    /     | |    |  __/", 'color:#ddd')
console.log("%c| |\\ \\    _| |_   | |   ", 'color:#ddd')
console.log("%c\\_| \\_|(_)\\___/(_)\\_| ", 'color:#ddd')
console.log('')
console.log(`你见过凌晨4点的洛杉矶吗？`);
console.log(`非凡的成就，往往伴随着非凡的孤独`);
console.log(`我所做的，就是一直重复、重复、重复`);
console.log(`这是是一个时代的终结，但，信仰不灭`);
console.log(`Mamba, never out`);
console.log(`%c=====================================`, 'color:#aaa');
console.log(`%c彩蛋：投中999球完成训练，触发隐藏彩蛋`, 'color:#03A9F4');
console.log(`%c如果你累了，试着同时按下键盘的2和4键，也可触发彩蛋`, 'color:#eee')
console.log(`%c=====================================`, 'color:#aaa');
console.log('')
console.log(`%c开发者：Guowc（微信weicheng000）`, 'color:#4CAF50')
console.log(`%c插画师：冬眠的熊 https://weibo.com/u/2178987865`, 'color:#4CAF50')

// 0 - matterjs
var Render = Matter.Render
var World = Matter.World
var Bodies = Matter.Bodies
var Body = Matter.Body
var Composites = Matter.Composites
var Events = Matter.Events

var engine = Matter.Engine.create()
var world = engine.world
world.gravity.y = 1.4
var ww = window.innerWidth,
    wh = window.innerHeight,
    cx = ww / 2,
    cy = wh / 2

if (ww < 1500) {
  const courtEl = document.getElementById('court')
  courtEl.style.display = "block"
}
// 1 - 调试器
var render = Render.create({
  element: document.getElementById('physic'),
  engine: engine,
  options: {
    width: ww,
    height: wh,
    wireframes: false,
    background:'rgba(0,0,0,0)',
    showIds:true
  }
})
var App, Stage
var playState = false
var balls = [], sprites
var shoting = false
var score = 0
var stageEl = document.getElementById('stage')
var maskEl = document.getElementById('mask')
var scoreEl = document.getElementById('score')
var recordEl = document.getElementById('record')
var asideEl = document.getElementById('aside')
var loaderEl = document.getElementById('loader')
var playEl = document.getElementById('play')
var bigEl = document.getElementById('bigtxt')
var endEl = document.getElementById('endtxt')
var resEl = document.getElementById('restart')
var guideEl = document.getElementById('guide')

var soundsInited = false
var Sound
var hit, net, xie
var startDJ
var ending = localStorage.getItem('ending')
if (ending) {
  playState = true
  setTimeout(()=>{
    maskEl.className = 'Mask hide'
    loaderEl.className = "Loader hide"
  }, 1000)
} else {
  startDJ = new Howl({
    src: ['sounds/start.mp3'],
  });
  startDJ.on('load', () => {
    setTimeout(function(){
      loaderEl.className = "Loader loaded"
    }, 1000)
  })
}

window.addEventListener('mousedown', function(){
  if (soundsInited) return
  hit = new Howl({
    src: ['sounds/hit.mp3'],
    volume: 0.1
  });
  net = new Howl({
    src: ['sounds/net.mp3'],
  });
  soundsInited = true
})
var st, dt = 0
var Kobe
var ballSprite = new PIXI.Sprite.from('res/ball.png');

var Mamba = function(){
  this.init()
};
Mamba.prototype = {
  init : function(){

    // 2 - 初始化PIXI canvas
    var canvas = document.getElementById('canvas')
    App = new PIXI.Application({
        width: ww,
        height: wh,
        transparent: true
    })
    Stage = App.stage
    canvas.appendChild(App.view)

    // 3 - 创建球场背景
    const court = PIXI.Sprite.from('res/zoom.png');
    // court.width = 1344
    // court.height = 322
    court.scale.x = court.scale.y = .8
    court.anchor.set(0.5)
    court.x = cx
    court.y = cy + 140

    Stage.addChild(court)



    const stands = PIXI.Sprite.from('res/stands.png')
    stands.width = 308
    stands.height = 406
    stands.x = cx + 250
    stands.y = cy - 260
    Stage.addChild(stands)

    sprites = new PIXI.Container
    Stage.addChild(sprites)

    const kuang = PIXI.Sprite.from('res/kuang.png')
    kuang.x = cx + 258
    kuang.y = cy - 148
    kuang.scale.x = kuang.scale.y = 0.7
    Stage.addChild(kuang)

    // 4 - 创建篮板、地板（静态刚体）
    var floor = Bodies.rectangle(cx + 100, cy + 120, 700, 10, {
      isStatic: true,
      render: { visible: false}
    })
    var floor1 = Bodies.rectangle(cx + 446, cy, 10, 240, {
      isStatic: true,
      render: { visible: false}
    })
    var floor2 = Bodies.rectangle(cx + 410, cy - 170, 100, 10, {
      isStatic: true,
      render: { visible: false}
    })
    var floor3 = Bodies.rectangle(cx + 430, cy + 96, 30, 40, {
      isStatic: true,
      render: { visible: false}
    })
    var rebound = Bodies.rectangle(cx + 315, cy - 180, 6, 120, {
      isStatic: true,
      render: { visible: false}
    })
    // 5 - 创建篮框2个关键碰撞点（静态刚体）
    var hoop1 = Bodies.circle(cx + 261, cy - 147, 3, {
      isStatic: true,
      render: {
        visible: false,
        fillStyle: '#89ff3a',
        opacity:.8
      }
    })
    var hoop2 = Bodies.circle(cx + 302, cy - 147, 3, {
      isStatic: true,
      render: {
        visible: false,
        fillStyle: '#89ff3a',
        opacity:.8
      }
    })
    // 6 - 创建篮网
    var nets =  Composites.softBody(cx + 260, cy - 146, 8, 4, 0, 0, false, 3, { // 篮球网
        firction: 1, // 摩擦力
        frictionAir: 0.05, // 空气摩擦力
        // restitution: 0.0001, // 弹性
        render: { visible: false },
        collisionFilter: { group: Body.nextGroup(true) }
    }, {
        render: { lineWidth: 2, strokeStyle: "#fff" },
        stiffness: 1.4
    })
    nets.bodies[0].isStatic = true;
    nets.bodies[7].isStatic = true;
    World.add(world, [
        floor,
        floor1,
        floor2,
        floor3,
        rebound,
        hoop1,
        hoop2,
        nets
    ]);
    this.getStatus()
    this.createKobe()
    this.updateScore()
    // 7 - 启动引擎和渲染器
    Matter.Engine.run(engine)
    Matter.Render.run(render)

    // 8 - 启动刷新器
    // Events.on(engine, 'beforeUpdate', (e) => {
    //   this.update()
    // })
    App.ticker.add((delta) => {
        this.update(delta)
        TWEEN.update();
    });
    var nt = 0,lt = 0
    Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      nt = new Date().getTime()
      for (var i = 0; i < pairs.length; i++) {
           var pair = pairs[i];
           if ((pair.bodyA.id === 1 || pair.bodyA.id === 5) && pair.collision.depth >1) {
              var vol = pairs[i].collision.depth / 10
              hit.play()

           }
       }
       lt = new Date().getTime()
    })
  },
  getStatus() {
    var ending = localStorage.getItem('ending')
    if (ending) {
    }
  },
  updateScore (number) {
    if (!number) {
      score = localStorage.getItem('score') || 0
    } else {
      score = number
    }
    score = '00' + score
    score = score.substring(score.length - 3, score.length)
    var tpl = ''
    for (var i = 0; i < 3; i++) {
      tpl += '<i class="n'+ score[i] +'"></i>'
    }
    scoreEl.innerHTML = tpl
    this.setRecord(score)
  },
  setAside() {
    var ts = [16, 90, 150, 200, 270, 320, 390, 460]
    var index = 0
    var dt = 0
    var say
    var tpl
    startDJ.play()
    var tick = setInterval(() => {
      dt ++
      if (dt === ts[index]) {
        say = START[index]
        tpl = '<p class="en">'+ say.en +'</p><p class="cn">'+ say.cn +'</p>'
        asideEl.innerHTML = tpl
        index++
        if (index === 8) {
          asideEl.className = 'Aside hide'
          bigEl.className = 'Bigtxt flash'
          setTimeout(() =>{
            maskEl.className = 'Mask hide'
            playState = true
          }, 16000)
          clearInterval(tick)
        }
      }
    }, 50)
  },
  setRecord(score) {
    if (score % 10 === 0 && score <= 200 && score > 0 || score == 1) {
      var index = Math.floor(score / 10)
      var say = RECORD[index]
      var tpl = '<p class="en">'+ say.en +'</p><p class="cn">'+ say.cn +'</p>'
      recordEl.innerHTML = tpl

      // recordEl.className = 'Record'
      // setTimeout(function(){
      //   recordEl.className = 'Record show'
      // }, 50)
    }
  },
  setNews() {
    var ts = [5, 40, 116, 190]
    var index = 0
    var dt = 0
    var say
    var tpl
    var tick = setInterval(() => {
      dt ++
      if (dt === ts[index]) {
        say = NEWS[index]
        tpl = '<p class="en">'+ say.en +'</p><p class="cn">'+ say.cn +'</p>'
        asideEl.innerHTML = tpl
        index++
        if (index === 4) {
          asideEl.className = 'Aside fadeout'
          setTimeout(()=>{
            endEl.innerHTML = '<p class="en">'+ ENDING[0].en +'</p><p class="cn">'+ ENDING[0].cn +'</p>'
          }, 4000)
          setTimeout(()=>{
            endEl.innerHTML = '<p class="en">'+ ENDING[1].en +'</p><p class="cn">'+ ENDING[1].cn +'</p>'
            resEl.className = "Restart show"
          },14000)
          clearInterval(tick)
        }
        // if (index === 5) {
        //   asideEl.className = 'Aside'
        //   setTimeout(()=>{
        //     asideEl.className = 'Aside fadeout'
        //   }, 2000)
        //   clearInterval(tick)
        // }
      }
    }, 50)
  },
  createKobe () {
    var that = this
    var file = ending ? 'res/kobe-gone.json' : 'res/kobe-ball.json'
    App.loader
    .add(file)
    .load(function(){
      const frames = [];

      for (let i = 1; i <= 37; i++) {
          const val = i < 10 ? `0${i}` : i;
          frames.push(PIXI.Texture.from(`kobe00${val}.png`));
      }
      // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
      Kobe = new PIXI.AnimatedSprite(frames);

      Kobe.x = cx - 220
      Kobe.y = cy - 20
      Kobe.anchor.set(0.5);
      Kobe.scale.x = Kobe.scale.y = 0.6
      Kobe.animationSpeed = 0.4;
      Kobe.loop = false

      Kobe.interactive = true;
      // Kobe.gotoAndStop(15)
      // that.shot(cx - 174, cy - 157, 0, 0)
      Kobe.onFrameChange = function (e) {
        if (e === 16) {
          // 出手
          // console.log(new Date().getTime())
          // console.log('dt', dt)
          var r = 1
          if (Math.abs(dt - 500) < 30) {
            r = 1
            setTimeout(function(){
              net.play()
            }, 750)
          } else {
            r = dt === 0 ? 1.2 + (Math.random() - 0.5) / 5 : dt / 500
          }
          if (r < 0.6) r = 0.6
          if (r > 1.2) r = 1.2

          var fx = 12.08 * r,
              fy = -10.1 * r
          shoting = true
          that.shot(cx - 174, cy - 157, fx, fy)
          that.end()
        }
      }
      App.stage.addChild(Kobe);

    });
  },
  end () {
    const alpha = {v: 1}
    const tween = new TWEEN.Tween(alpha)
        .delay(2000)
        .to({ v: 0}, 1000)
        .onUpdate(() => {
          balls[0].sprite.alpha = alpha.v
          if (alpha.v === 0) {
            Stage.removeChild(balls[0].sprite)
            World.remove(world, balls[0].bodies)
            balls.shift()
          }
        })
        .start();
  },
  shot (x, y, fx, fy) {
    // 11 - 创建篮球刚体
    var bodies = Bodies.circle(x, y, 15, {
      restitution: 0.7,
      density:0.05,
      firction: 1,
      sleepThreshold: 200,
      // isStatic: true,
      render: {
        visible:false
          // sprite: {
          //     texture: 'res/ball.png'
          // }
      }
    })
    World.add(world, bodies)
    var sprite = new PIXI.Container
    var ball = new PIXI.Sprite.from('res/ball.png')
    ball.anchor.set(.5)
    var shadow = PIXI.Sprite.from('res/shadow.png');
    shadow.anchor.set(.5)
    shadow.y = 14
    shadow.alpha = 0
    sprite.addChild(shadow)
    sprite.addChild(ball)
    sprites.addChild(sprite)
    sprite.x = x
    sprite.y = y
    // 12 - 施加初始向量
    Body.setVelocity(bodies, { x: fx, y: fy });
    // 13 - 施加角速度向量
    Body.setAngularVelocity(bodies, -0.1);

    balls.push({
      bodies: bodies,
      sprite: sprite
    })
  },
  update() {
    for (var i = 0; i < balls.length; i++) {
      var ball = balls[i].bodies
      if (ball.goal) continue
      // console.log(cx, cy, ball.position.x, ball.position.y)
      if (Math.abs(ball.position.x - (cx + 282)) < 10 && ball.position.y > (cy - 144) && ball.position.y < (cy - 124)) {
        ball.goal = true
        score++
        localStorage.setItem('score', score)
        this.updateScore(score)
        guideEl.className = 'Guide'
      }
    }

    for (var i = 0; i < balls.length; i++) {
      balls[i].sprite.position.x = balls[i].bodies.position.x
      balls[i].sprite.position.y = balls[i].bodies.position.y
      balls[i].sprite.children[1].rotation = balls[i].bodies.angle
      var dist = cy + 100 - balls[i].sprite.position.y
      if (dist < 50) {
        var r = 1 - dist / 50
        r = r > 1 ? 1 :r
        balls[i].sprite.children[0].scale.x = balls[i].sprite.children[0].scale.y = r
        balls[i].sprite.children[0].alpha = r
      }

    }
  },
}
var mamba = new Mamba();



var force = 0
// 10 - 获取篮球初始发射向量

var startX = 240, startY = 370, endX, endY, power

stageEl.addEventListener('mousedown', function(e){
  // startX = e.clientX
  // startY = e.clientY
  if (!playState) return
  Kobe.gotoAndPlay(0)
  // setTimeout(function(){
  //   xie && xie.play()
  // }, 1200)
  // console.log(new Date().getTime())
  dt = 0
  st = e.timeStamp
})

stageEl.addEventListener('mouseup', function(e){
  dt = e.timeStamp - st
  // shoting = true
  // dt = (e.timeStamp - st)/300
  // var fx = 14.4 * dt,
  //     fy = -15.6 * dt
  // kobe.shot(startX, startY, fx, fy)
  // setTimeout(() => {
  //   // net.play()
  // },850)
})
window.addEventListener('resize', function(){
  location.reload(true)
})
var keys = [], trigger = false
window.addEventListener('keydown', function(e){
  keys = []
})
window.addEventListener('keyup', function(e){
  if (trigger) return
  keys.push(e.keyCode)
  if (keys[0] + keys[1] === 102 || Math.abs(keys[0] - keys[1]) === 2){
    var posterEl = document.getElementById('poster')
    asideEl.className = 'Aside'
    asideEl.innerHTML = ''
    trigger = true
    var mambaout = new Howl({
      src: ['sounds/mambaout.mp3'],
      onload: function() {
        setTimeout(()=>{
          mambaout.play()
          mamba.setNews()
        }, 2000)
        document.body.className = 'Mambaout'
      }
    });

  }
})

playEl.addEventListener('click', function(){
  loaderEl.remove()
  mamba.setAside()
  maskEl.className = 'Mask in'
  playState = true
})
resEl.addEventListener('click', function(){
  localStorage.setItem('ending', true)
  location.reload(true)
})
