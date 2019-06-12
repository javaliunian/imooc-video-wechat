const app = getApp()
var videoUtil = require("../../util/util.js");
Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,
    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",


    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    //用于判断这三个tab哪个该隐藏，默认不隐藏作品
    myWorkFlag: false,
    myLikeFlag: true,
    myFollowFlag: true

  },
  onLoad: function(params) {
    var me = this;
    // var user = app.userInfo;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var publisherId = params.publisherId;
    var userId = user.id;
    if (publisherId != null && publisherId != undefined && publisherId != '') {
      userId = publisherId;
      me.setData({
        isMe: false,
        publisherId: publisherId,
        serverUrl:serverUrl
      })
    }
    me.setData({
      userId:userId
    })

    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + '&fanId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        var user = app.getGlobalUserInfo();
        wx.hideLoading();
        var faceUrl = "../resource/images/noneface.png";
        if (res.data.status == 200) {
          var userInfo = res.data.data;
          if (userInfo.faceImage != null && userInfo.faceImage != "" && userInfo.faceImage != undefined) {
            faceUrl = serverUrl + userInfo.faceImage;
          }

          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow
          });
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            success: function() {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
    this.getMyWork(1)
  },
  logout: function() {
    // var user = app.userInfo;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: 'POST',
      header: 'application/json',
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          //清除客户端的用户信息
          // app.userInfo = null;
          wx.removeStorageSync("userInfo")
          wx.showToast({
            title: '注销成功',
          })
          //跳转到登录页面
          wx.reLaunch({
            url: '../userLogin/login',
          })
        }
      }
    })
  },
  changeFace: function() {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);

        //选择完之后进行上传
        wx.showLoading({
          title: '上传中...',
        })
        var serverUrl = app.serverUrl;
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + app.getGlobalUserInfo().id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json',
            'userId': app.getGlobalUserInfo().id,
            'userToken': app.getGlobalUserInfo().userToken
          },
          success: function(res) {
            wx.hideLoading();
            var data = JSON.parse(res.data);
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功！',
                icon: 'success'
              });
              var imageUrl = data.data;
              me.setData({
                faceUrl: serverUrl + imageUrl
              })

            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg,
                icon: 'none'
              })
            } else if (data.status == 502) {
              wx.showToast({
                  title: data.msg,
                  icon: 'none'
                }),
                wx.navigateTo({
                  url: '../userLogin/login',
                })
            }

          }
        })
      }
    })
  },

  uploadVideo: function() {
    videoUtil.uploadVideo();
  },

  followMe: function(e) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = me.data.publisherId;

    var followType = e.currentTarget.dataset.followtype;

    var url = '';
    // 1:关注   0:取消关注
    if (followType == '1') {
      url = '/user/concern?userId=' + publisherId + '&fansId=' + userId;
    } else {
      url = '/user/cancelConcern?userId=' + publisherId + '&fansId=' + userId;
    }
    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'userId': userId,
        'userToken': user.userToken
      },
      success: function() {
        wx.hideLoading();
        if (followType == '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          })

        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          })
        }

      }
    })

  },
  doSelectWork: function() {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",
      myWorkFlag: false,
      myLikeFlag: true,
      myFollowFlag: true,
      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

    });
    this.getMyWork(1);
  },
  doSelectLike: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",
      myWorkFlag: true,
      myLikeFlag: false,
      myFollowFlag: true,
      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

    })
    this.getMyLike(1);
  },
  doSelectFollow: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",
      myWorkFlag: true,
      myLikeFlag: true,
      myFollowFlag: false,
      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

    });
    this.getMyFollow(1);
  },
  getMyWork: function(page) {
    var me = this;

    var serverUrl = app.serverUrl;

    var user = app.getGlobalUserInfo();

    wx.showLoading();
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&pageSize=6',
      method: 'POST',
      data: {
        userId: me.data.userId
      },
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var myVideoList = res.data.data.rows;
          var newMyVideoList = me.data.myVideoList;
        
          me.setData({
            myVideoList: newMyVideoList.concat(myVideoList),
            myVideoPage: page,
            myVideoTotal: res.data.data.total,
            serverUrl: app.serverUrl
          })
        }

      }
    })
  },
  getMyLike: function(page) {
    var me = this;

    var serverUrl = app.serverUrl;

    var user = app.getGlobalUserInfo();

    wx.showLoading();
    wx.request({
      url: serverUrl + '/video/showMyLike?userId=' + me.data.userId + '&page=' + page + '&pageSize=6',
      method: 'POST',

      header: {
        'content-type': 'application/josn',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var myLikeList = res.data.data.rows;
          var newMyLikeList = me.data.likeVideoList;
        
          me.setData({
            likeVideoList: newMyLikeList.concat(myLikeList),
            myLikePage: page,
            myLikeTotal: res.data.data.total,
            serverUrl: app.serverUrl
          })
        }

      }
    })

  },
  getMyFollow: function(page) {
    var me = this;

    var serverUrl = app.serverUrl;

    var user = app.getGlobalUserInfo();

    wx.showLoading();
    wx.request({
      url: serverUrl + '/video/showMyFollow?userId=' + me.data.userId + '&page=' + page + '&pageSize=6',
      method: 'POST',

      header: {
        'content-type': 'application/josn',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var myFollowList = res.data.data.rows;
          var newMyFollowList = me.data.followVideoList;
       
          me.setData({
            followVideoList: newMyFollowList.concat(myFollowList),
            myFllowPage: page,
            myFllowTotal: res.data.data.total,
            serverUrl: app.serverUrl
          })
        }

      }
    })
  },


  //触底后刷新（上拉刷新）
  onReachBottom:function(){
    var myWorkFlag=this.data.myWorkFlag;
    var myLikeFlag=this.data.myLikeFlag;
    var myFollowFlag=this.data.myFllowFlag;

    if(!myWorkFlag){
      var currentPage=this.data.myVideoPage;
      if(currentPage==this.data.myVideoTotal){
        wx.showToast({
          title: '已经没有了~',
          icon:'none'
        });
        return;
      }
      var page=currentPage+1;
      this.getMyWork(page);
    }else if(!myLikeFlag){
      var currentPage = this.data.myLikePage;
      if (currentPage == this.data.myLikeTotal) {
        wx.showToast({
          title: '已经没有了~',
          icon: 'none'
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLike(page);
    }else if(!myFollowFlag){
      var currentPage = this.data.myFollowPage;
      if (currentPage == this.data.myFollowTotal) {
        wx.showToast({
          title: '已经没有了~',
          icon: 'none'
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollow(page);
    }
  },

  showVideo:function(e){
    var me=this;
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFllowFlag;
    var videoList = [];
    if (!myWorkFlag) {
      videoList = me.data.myVideoList;
    } else if (!myLikeFlag){
      videoList = me.data.myLikeList;
    }else if(!myFollowFlag){
      videoList = me.data.myFollowList;
    }
    var arrIndex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrIndex]);

    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
    
  },
  
 



})