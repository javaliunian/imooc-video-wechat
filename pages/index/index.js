 const app = getApp()

Page({
  data: {
    //用于分页的属性
    totalPage:1,
    page:1,
    videoList: [],
    screenWidth: 350,
    serverUrl: "",

    searchContent: ""
  },

  onLoad: function (params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });
    var searchContent=params.searchContent;
    var isSaveRecord=params.isSaveRecord;
    if(isSaveRecord==null ||isSaveRecord==''||isSaveRecord==undefined){
      isSaveRecord=0;
    }
    me.setData({
      searchContent: searchContent
    });

    //获取当前的分页数
    var page=me.data.page;
    me.getAllVideoList(page,isSaveRecord);


    
  },
  getAllVideoList: function(page,isSaveRecord){
    var me=this;
    var serverUrl = app.serverUrl;
    var searchContent=me.data.searchContent;
    wx.showLoading({
      title: '加载中...',
    });

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page+'&isSaveRecord='+isSaveRecord,
      method: 'POST',
      data:{
          videoDesc:searchContent
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        //判断当前page是否是第一页，如果是第一页，就将videoList清空
        if (page === 1) {
          me.setData({
            videoList: []
          })
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;
  

        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  }, 

  onPullDownRefresh:function(){
    this.getAllVideoList(1,0);
    wx.showNavigationBarLoading();
  },

  onReachBottom:function(){
    var me=this;
    var currentPage=me.data.page;
    //判断当前页数和总页数是否相等，如果相等，就无需上拉刷新
    if(currentPage===me.data.totalPage){
       wx.showToast({
         title: '已经到底了~~',
         icon:"none"
       });
       return;
    }else{
      currentPage++;
    }

    me.getAllVideoList(currentPage,0)
  },
  showVideoInfo:function(e){
    var me=this; 
    var videoList=me.data.videoList;
    var arrIndex=e.target.dataset.arrindex;
    var videoInfo=JSON.stringify(videoList[arrIndex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo='+videoInfo,
    })
  },
 

})