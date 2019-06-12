const app = getApp()
var videoUtil=require("../../util/util.js");
Page({
  data: {
    videoId: "",
    src:"",
    videoInfo:{},
    cover:"contain",
    userLikeVideo:false,
    placeholder:"说点什么...",

    commentsPage:1,
    commentsTotalPage:1,
    commentsList:[]
  },
  videoCtx:{},
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  onLoad:function(params){
    var me=this;
    me.videoCtx=wx.createVideoContext('myVideo', me);

    //获取上一个页面传过来的参数
    var videoInfo=JSON.parse(params.videoInfo);
    var height=videoInfo.videoHeight;
    var width=videoInfo.videoWidth; 
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    var cover="cover";
    if(width>=height){
      cover="";
    }
    if(width<screenWidth){
      cover="contain"
    }

    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl+videoInfo.videoPath,
      videoInfo: videoInfo,
      // cover:cover
    })

    var serverUrl=app.serverUrl;
    var userInfo = app.getGlobalUserInfo(); 
    var loginUserId="";
    if(userInfo!=null&&userInfo!=undefined&&userInfo!=''){
      loginUserId=userInfo.id;
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId+'&videoId='+videoInfo.id+'&publishUserId='+videoInfo.userId,
      method:'POST',
      success:function(res){
        console.log(res);

        var publisher=res.data.data.publisher;
        var userLikeVideo=res.data.data.userLikeVideo;
        me.setData({
          publisher: publisher,
          userLikeVideo: userLikeVideo,
          serverUrl: serverUrl
        })

      }
    })
    me.getCommentsList(1);
  },
  onShow: function(){
    var me = this;
    me.videoCtx.play();

  },
  onHide:function(){
    var me = this;
    me.videoCtx.pause();
  },

  upload:function(){
    var me=this;
    var userInfo = app.getGlobalUserInfo(); 
    var videoInfo=JSON.stringify(me.data.videoInfo);
    var realUrl='../videoInfo/videoInfo#videoInfo@'+videoInfo;

    if (userInfo == null || userInfo == undefined || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl='+realUrl,
      })
    }else{
      videoUtil.uploadVideo();
    }
  
  },
  showIndex: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  showMine: function(){
    var userInfo = app.getGlobalUserInfo();
    if(userInfo==null||userInfo==undefined || userInfo==''){
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }else{
      wx.navigateTo({
        url: '../mine/mine',
      })
    }


    
  },
  showPublisher: function () {
    var me = this;
    var userInfo = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (userInfo == null || userInfo == undefined || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + me.data.videoInfo.userId,
      })
    }

  },

  likeVideoOrNot:function(){
    var me=this;
    var videoInfo=JSON.stringify(me.data.videoInfo);
    var userInfo = app.getGlobalUserInfo();
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;
    if (userInfo == null || userInfo == undefined || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl='+realUrl,
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo;
      var url = '/video/userLike?userId=' + userInfo.id+'&videoId='+videoInfo.id+'&videoCreaterId='+videoInfo.userId;
      if(userLikeVideo){
        var url = '/video/userUnLike?userId=' + userInfo.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }
      var serverUrl=app.serverUrl;
      wx.request({
        url: serverUrl+url,
        method:'POST',
        header:{
          'content-type':'application/json',
          'userId': userInfo.id,
          'userToken':userInfo.userToken
        },
        success:function(res){
          if(res.data.status==200){
            me.setData({
              userLikeVideo: !userLikeVideo
            })
          }else if(res.data.status==502){
            wx.showToast({
              title: '请登录...',
              icon:'none',
              duration:3000
            })
            wx.navigateTo({
              url: '../userLogin/login',
            })
          }
          
        }
      })
    }

  },
  shareMe: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享'],
      success: function (res) {
        if (res.tapIndex == 0) {
          //下载视频
          wx.showLoading({
            title: '下载中',
          });
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          //举报用户
          var videoInfo=me.data.videoInfo;
          var realUrl='../videoInfo/videoInfo#videoInfo@'+videoInfo;
          if(user==null || user==undefined ||user==''){
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl='+realUrl,
            })
          }else{
            var publisUserId=me.data.videoInfo.userId;
            var videoId=me.data.videoInfo.id;
            wx.navigateTo({
              url: '../report/report?publishUserId='+publisUserId+'&videoId='+videoId,
            })
          }
         
        } else {
          //分享    
          onShareAppMessage();
        }
      }
    })
  },
  onShareAppMessage:function(){
    var videoInfo=this.data.videoInfo;
    return {
      title:'短视频分享',
      path:'pages/videoInfo/videoInfo?videoInfo='+JSON.stringify(videoInfo)
    }
  },
  leaveComment:function(){
    this.setData({
      commentFocus:true
    })
  },
  replyFocus:function(e){
    var fatherCommentId=e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder:"回复 "+toNickname,
      replyFatherCommentId:fatherCommentId,
      replyToUserId:toUserId,
      commentFocus: true,
      comment: ''
    })
  },

  saveComment:function(e){
    var me=this;
    var content=e.detail.value;

    //获取回复评论的fatherCommentId和 toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var userInfo = app.getGlobalUserInfo();
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + JSON.stringify(me.data.videoInfo);
    if (userInfo == null || userInfo == undefined || userInfo == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl='+realUrl,
      })
    } else{
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId +'&toUserId='+toUserId,
        method:'POST',
        header:{
          'content-type': 'application/json',
          'userId': userInfo.id,
          'userToken': userInfo.userToken
        },
        data:{
          fromUserId:userInfo.id,
          videoId:me.data.videoInfo.id,
          comment: content
        },
        success:function(res){
          if (res.data.status == 200) {
            me.setData({
              comment: '',
              commentsList:[]
            })
            me.getCommentsList(1);
          } else if (res.data.status == 502) {
            wx.showToast({
              title: '请登录...',
              icon: 'none',
              duration: 3000
            })
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          }
          
        }
      })
    }
    

  },
  getCommentsList:function(page){
    var me=this;
    var videoId=me.data.videoId;
    wx.request({
      url: app.serverUrl+'/video/getComment?videoId='+videoId+'&page='+page,
      method:'POST',
      success:function(res){
        var commentsList=res.data.data.rows;
        var newCommentsList=me.data.commentsList;
        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total,
          toNickName:res.data.data.toNickName,
          nickname:res.data.data.nickname
        })
      }
    })
  },
  onReachBottom:function(){
    var me=this;
    var currentPage=me.data.commentsPage;
    var totalPage=me.data.commentsTotalPage;
    if(currentPage==totalPage){
      return;
    }else{
      var page=currentPage+1;
      me.getCommentsList(page);
    }
  }


})