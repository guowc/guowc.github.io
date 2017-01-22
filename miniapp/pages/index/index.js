//index.js
//获取应用实例
var mtapplet = 'http://mtapplet.meitudata.com/'
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  saveFile: function(){
    wx.downloadFile({
      url: 'https://mtapplet.meitudata.com/586c953a0390b3ad724c4.jpg', 
      type: 'image',
      success: function(res) {
        console.log(res)
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function(res) {
            var savedFilePath = res.savedFilePath
            console.log(savedFilePath);
            wx.showToast({
              title: '图片保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail:function (res) {
            console.log(res)
          }
        })
      }
    })
    
  },
  uploadFile: function () {
    var _this = this;
    
    
      wx.chooseImage({
        count: 1,
        //original原图，compressed压缩图
        sizeType: ['original'],
        //album来源相册 camera相机
        sourceType: ['album', 'camera'],
        //成功时会回调
        success: function (res) {
          var tempFilePaths = res.tempFilePaths[0];

          wx.showToast({
            title: '上传中',
            icon: 'loading',
          })
          _this.refreshUploadToken(() => {
            var tokenObj = JSON.parse(_this.uploadToken);
            var key = tokenObj.key;
            var token = tokenObj.upload_token;
            
            wx.uploadFile({
              url: 'https://up.qbox.me',
              filePath: tempFilePaths,
              name: 'file',
              formData: {
                'key': key,
                'token': token,
              },
              success: function (res) {
                var data = JSON.parse(res.data)
                var src = mtapplet + data.key
                _this.handle(src)
              },
              fail(error) {
                console.log(error)
              },
              complete(res) {
                // console.log(res)
              }
            })
          })
        }
      })
  },
  handle: function(src){
    wx.request({
      url: 'https://make.channet.com/rolleye/index/handleAnime',
      data: {
        tips : 313,
        pic : src
      },
      dataType: 'jsonp',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = JSON.parse(res.data)
        wx.navigateTo({
          url: '../make/make?img=' + data.pic,
        })
        wx.hideToast()
      }
    });
    
  },
  refreshUploadToken(callback) {
    var _this = this,
      cbk = callback || function () { };

    wx.request({
      url: 'https://applet.meitu.com/public/index/token',
      data: {},
      dataType: 'jsonp',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        _this.uploadToken = res.data;
        cbk();
      }
    });
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    wx.getSavedFileList({
  success: function(res) {
    console.log(res.fileList)
  }
})
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  onShareAppMessage: function () {
    return {
      title: '美妆相机特效',
      desc: '美妆相机特效',
      path: '/page/user?id=123'
    }
  }
})
