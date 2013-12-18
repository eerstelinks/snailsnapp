// default upload function
Ti.include('/js/upload.js');

function checkUserData(callback, errorCallback) {

  // check only when user is logged and is connected
  if (!facebook.loggedIn || !Titanium.Network.online) {

    if (typeof errorCallback == 'function') {
      errorCallback();
    }
    return false;
  }

  updateUserData(callback);
}


function updateUserData(callback) {

  if (typeof callback == 'function') {
    var timeout = setTimeout(callback, 30 * 1000);
  }

  // get all facebook user updated_time
  facebook.requestWithGraphPath('me', {}, 'GET', function(e) {

    if (e.success) {

      var sendData = JSON.parse(e.result);

      if (Ti.App.Properties.getString('apple_device_token_id', false)) {
        sendData.apple_device_token_id = Ti.App.Properties.getString('apple_device_token_id');
      }
      else if (Ti.Network.getRemoteDeviceUUID()) {
        sendData.apple_device_token_id = Ti.Network.getRemoteDeviceUUID();
      }

      uploadToSnailsnapp(

        // path to post to
        '/post/user/update',

        // succe callback
        function(response) {

          if (response.status == 'success') {
            if (response.show_latitude && response.show_longitude) {
              Ti.App.Properties.setObject('user_city_geolocation', { latitude: response.show_latitude, longitude: response.show_longitude });
            }
          }
          else {
            showErrorAlert(L('update_user_failed_message'), L('update_user_failed_button'));
          }

          if (typeof callback == 'function') {
            clearTimeout(timeout);
            callback();
          }
        },

        // error callback
        function(e) {

          showErrorAlert(L('update_user_failed_message'), L('update_user_failed_button'));

          if (typeof callback == 'function') {
            clearTimeout(timeout);
            callback();
          }
        },

        // data to be send
        sendData
      );


    }
  });
}