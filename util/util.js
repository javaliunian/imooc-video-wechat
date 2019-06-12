function uploadVideo() {
  var me = this;
  wx.chooseVideo({
    sourceType: ['album'],
    maxDuration: 20,
    success(res) {
      console.log(res.tempFilePath)
      var duration = res.duration;
      var tmpHeight = res.heigth;
      var tmpWidth = res.width;
      var tmpVideoUrl = res.tempFilePath;
      var tmpCoverUrl = res.thumbTempFilePath;
      if (duration > 21) {
        wx.showToast({
          title: '视频长度不能超过20秒...',
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '视频长度太短，请上传超过1秒的视频...',
        })
      } else {
        // 打开选择bgm的页面
        console.log(duration);
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            "&tmpHeight=" + tmpHeight +
            "&tmpWidth=" + tmpWidth +
            "&tmpVideoUrl=" + tmpVideoUrl +
            "&tmpCoverUrl=" + tmpCoverUrl
        })
      }
    }
  })
};
module.exports={
  uploadVideo:uploadVideo
}