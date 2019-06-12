const app = getApp()

Page({
    data: {

    },
    doRegist:function(e){
      var formObject=e.detail.value;
      var username=formObject.username;
      var password=formObject.password;

      //简单验证
      if(username.length==0 || password.length==0){
        wx.showToast({
          title: '用户名或密码不能为空',
          duration:3000,
          icon:'none'
        })
      } else {
        var serverUrl=app.serverUrl;
        wx.request({
          url: serverUrl+'/regist',
          method: 'POST',
          data:{
            username:username,
            password:password
          },
          header:{
            'content-type':'application/json'
          },
          success:function(res){
            if(res.data.status==200){
              wx.showToast({
                title: '注册成功',
                duration: 3000,
                icon: 'none'
              })
              // app.userInfo=res.data.data;
              //使用全局缓存获取信息
              app.setGlobalUserInfo(res.data.data);
            }else{
              wx.showToast({
                title: res.data.msg,
                duration: 3000,
                icon: 'none'
              })
            }
          }
        })
      }
    },
    goLoginPage:function(){
      wx.redirectTo({
        url: '../userLogin/login'
      })
    }

    
})