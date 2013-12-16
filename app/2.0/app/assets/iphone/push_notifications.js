Ti.Network.registerForPushNotifications({
  types: [
    Ti.Network.NOTIFICATION_TYPE_BADGE,
    Ti.Network.NOTIFICATION_TYPE_ALERT
  ],
  success:function(e) {
    // save device token
    Ti.App.Properties.setString('apple_device_token_id', e.deviceToken);
  },
  error:function(e) {
    //alert("Error during registration: "+e.error);
  },
  callback:function(e) {
    // called when a push notification is received.
    var data = JSON.parse(e.data);
    var badge = data.badge;
    if (badge > 0) {
      Titanium.UI.iPhone.appBadge = badge;
    }
    var message = data.message;
    if (message != ''){
      var my_alert = Ti.UI.createAlertDialog({title:'', message: message});
      my_alert.show();
    }
  }
});