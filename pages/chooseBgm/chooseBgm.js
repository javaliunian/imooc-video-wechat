const app = getApp()

Page({
  onReady: function(e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
  },
  data: {
    bgmList: {},
    serverUrl: "",
    videoParams: {}
  },
  onLoad: function(params) {
    console.log(params);
    var me = this;
    // var user = app.userInfo;

    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;

    me.setData({
      videoParams: params
    })

    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: serverUrl + '/bgm/list',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl,
          })
        }



      }
    })
  },
  upload: function(e) {
    var me = this;
    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;
    var serverUrl = app.serverUrl;

    console.log("bgmId:" + bgmId);
    console.log("desc:" + desc);
    var duration = me.data.videoParams.duration;
    var tmpHeight = me.data.videoParams.tmpHeight == "undefined" ? 0 : me.data.videoParams.tmpHeight;
    var tmpWidth = me.data.videoParams.tmpWidth;
    var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
    var tmpCoverUrl = me.data.videoParams.tmpCoverUrl;


    //上传短视频
    wx.showLoading({
      title: '上传中...',
    })
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      formData: {
        userId: app.getGlobalUserInfo().id,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth,
        bgmId: bgmId,
        desc: desc
      },
      filePath: tmpVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/json', // 默认值
        'userId': app.getGlobalUserInfo().id,
        'userToken': app.getGlobalUserInfo().userToken
      },
      success:function(res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        if (data.status == 200) {
          wx.showToast({
            title: '上传成功',
          });
          wx.navigateBack({
            delta: 1,
          })

          //上传封面
          // wx.showLoading({
          //   title: '上传中...',
          // })
          // wx.uploadFile({
          //   url: serverUrl + '/video/uploadCover',
          //   formData: {
          //     userId: app.userInfo.id,
          //     videoId: data.data
          //   },
          //   filePath: tmpCoverUrl,
          //   name: 'file',
          //   header: 'application/json',
          //   success(res) {
          //     wx.hideLoading();
          //     var data = JSON.parse(res.data);
          //     if (data.status == 200) {

          //       wx.showToast({
          //         title: '上传成功',
          //       });
          //       wx.navigateBack({
          //         delta:1,
          //       })

          //     } else if (data.status == 500) {
          //       wx.showToast({
          //         title: '上传失败~~',
          //       })
          //     }

          //   }
          // })

        } else if (data.status == 500) {
          wx.showToast({
            title: '上传失败~~',
          })
        } else if (data.status == 502) {
          wx.showToast({
            title: '请登录...',
          });
          var realUrl = '../chooseBgm/chooseBgm#duration@' + duration +
            "-tmpHeight@" + tmpHeight +
            "-tmpWidth@" + tmpWidth +
            "-tmpVideoUrl@" + tmpVideoUrl +
            "-tmpCoverUrl@" + tmpCoverUrl;
          wx.navigateTo({
            url: '../userLogin/login?redirectUrl=' + realUrl,
          })
        }

      },
      fail:function(res){
        console.log(res);
      }
    })

  }
})