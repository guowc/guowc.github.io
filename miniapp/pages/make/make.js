const prefix = 'http://xiuxiu.huodong.meitu.com/faceWar/images/sucai/'
var ctx = wx.createCanvasContext('js-canvas')

Page({
  data: {
      photo:'',
      widget : `${prefix}1.png`,
      texture : [
          { src : `${prefix}1.png`},
          { src : `${prefix}2.png`},
          { src : `${prefix}3.png`},
          { src : `${prefix}4.png`},
          { src : `${prefix}5.png`},
          { src : `${prefix}6.png`},
          { src : `${prefix}7.png`},
          { src : `${prefix}8.png`},
          { src : `${prefix}9.png`},
          { src : `${prefix}10.png`},
          { src : `${prefix}11.png`},
          { src : `${prefix}12.png`},
          { src : `${prefix}13.png`},
          { src : `${prefix}14.png`},
          { src : `${prefix}15.png`},
          { src : `${prefix}16.png`},
      ],
      animationData: {},
      left:30,
      top:150,
      scale : 1,
      angle : 0
  },
  select: function(e){
      var src = e.target.dataset.src
      this.setData({
          widget : src
      })
  },
  onRotate: function (r) {
    this.animation.rotate(r).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  onScale: function (s) {
    this.animation.scale(s).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  dot: function(v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
  },
  getLen: function(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
  },
  getAngle: function(v1, v2) {
      var mr = this.getLen(v1) * this.getLen(v2);
      if (mr === 0) return 0;
      var r = this.dot(v1, v2) / mr;
      if (r > 1) r = 1;
      return Math.acos(r);
  },
  cross: function(v1, v2) {
      return v1.x * v2.y - v2.x * v1.y;
  },
  getRotateAngle: function(v1, v2) {
      var angle = this.getAngle(v1, v2);
      if (this.cross(v1, v2) > 0) {
          angle *= -1;
      }
      return angle * 180 / Math.PI;
  },
  
  touchstart: function(e){
      
      if(e.touches.length>1){
          
          this.x1 = e.touches[0].pageX;
          this.y1 = e.touches[0].pageY;
          var v = { x: e.touches[1].pageX - this.x1, y: e.touches[1].pageY - this.y1 };
          var preV = this.preV
          preV.x = v.x
          preV.y = v.y
          this.pinchStartLen = this.getLen(preV)
          
      }
  },
  touchmove : function(e){
      
      if (!e.touches) return;
      
      if(e.touches.length > 1){
          var v = { x: e.touches[1].pageX - e.touches[0].pageX, y: e.touches[1].pageY - e.touches[0].pageY };
          var preV = this.preV
          if (preV.x !== null) {
            this.scale = this.data.scale + (this.getLen(v) -  this.getLen(this.preV))/100;
            this.scale = this.scale<0.2?this.data.scale:this.scale
            this.angle = this.data.angle + this.getRotateAngle(v, preV)
            
            this.setData({
                scale : this.scale
            })
            this.setData({
                angle : this.angle
            })
            this.onTransform(this.angle,this.scale)
            this.preV.x = v.x
            this.preV.y = v.y
          }
      }else{
          this.cx = e.touches[0].clientX
          this.cy = e.touches[0].clientY
          if(!this.lx){
              this.lx = this.cx
              this.ly = this.cy
          }
          this.setData({
              left : this.data.left + (this.cx-this.lx),
              top : this.data.top + (this.cy-this.ly)
          })
          this.lx = this.cx
          this.ly = this.cy
      }    
  },
  touchend: function(){
      this.lx = undefined
      this.ly = undefined
      this.preV.x = 0;
      this.preV.y = 0;
      this.scale = 1;
      this.pinchStartLen = null;
      this.x1 = this.x2 = this.y1 = this.y2 = null;
  },
  onTransform: function (r,s) {
    this.animation.rotate(r).scale(s).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  rotateChange : function(e){
      const r = 3.6 * (50 - e.detail.value)
      this.onRotate(r)
  },
  scaleChange : function(e){
      const s = e.detail.value / 50
      this.onScale(s)
  },
  drawImg : function(r){
      ctx.drawImage(this.data.widget, 0, 0, 300, 92)
      ctx.rotate(10 * Math.PI / 180)
      ctx.draw()
  },
  compose: function(){
      wx.showToast({
        title: '生成中',
        icon: 'loading',
        duration: 2000
      })
  },
  onShow: function(){
      var animation = wx.createAnimation({
      duration: 60,
          timingFunction: 'linear',
      })
      this.animation = animation
      this.preV = { x: null, y: null };
  },
  onLoad: function (data) {
    var img = data.img
    this.setData({
        photo : img
    })
  }
})