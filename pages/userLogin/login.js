const app = getApp()

Page({
    data: {

    },
    onLoad:function(params){
      var me=this;
      if(Object.keys(params).length!=0){
        var redirectUrl = params.redirectUrl;
        redirectUrl = redirectUrl.replace(/#/g, "?");
        redirectUrl = redirectUrl.replace(/@/g, "=");
        redirectUrl = redirectUrl.replace(/-/g, "&");
        me.redirectUrl = redirectUrl;
      }
      
    },
    doLogin:function(e){
      var me=this;
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
        wx.showLoading({
          title: '请稍等...',
        })
        wx.request({
          url: serverUrl+'/login',
          method: 'POST',
          data:{
            username:username,
            password:password
          },
          header:{
            'content-type':'application/json'
          },
          success:function(res){
            wx.hideLoading();
            if(res.data.status==200){
              wx.showToast({
                title: '登录成功',
                duration: 3000,
                icon: 'none'
              })
              // app.userInfo=res.data.data;
              //使用全局缓存获取信息
              app.setGlobalUserInfo(res.data.data);
              //页面跳转
              var redirectUrl=me.redirectUrl;
              if(redirectUrl!=null&&redirectUrl!=''&&redirectUrl!=undefined){
                wx.navigateTo({
                  url: redirectUrl,
                })
              }else{
                wx.navigateTo({
                  url: '../mine/mine',
                })
              }
              
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
    toRegist:function(){
      wx.redirectTo({
        url: '../userRegist/regist'
      })
    }

    
})