Ti.include('/js/update_user_info.js');

// is the map already loaded?
var showedMap = Ti.App.Properties.getBool('showed_map', false);

// get arguments from the previous controller
var args = arguments[0] || {};

// always destroy login when closed
$.login.addEventListener('close', function() {
  $.destroy();
});

facebook.addEventListener('login', function(e) {

  if (e.success) {

    // hide logout button
    $.fbButton.hide();
    $.skipLogin.hide();
    $.fbLoader.show();

    // update user data with callback function
    checkUserData(
      function() {
        if (!showedMap && Ti.App.Properties.getBool('send_back_to_post_photo', false) === false) {
          Alloy.createController('index').getView().open();
        }

        // set timeout so the indicater will show
        setTimeout(function(){
          $.login.close();
        }, 500);
      },
      function () {
        // let user login again
        $.fbButton.show();
        $.skipLogin.show();
        $.fbLoader.hide();
      }
    );

  }
  else {
    showErrorAlert(L('fb_login_failed_message'), L('fb_login_failed_title'));
    $.fbButton.show();
    $.fbLoader.hide();
  }
});

if (!facebook.getLoggedIn()) {
  $.fbButton.show();
  $.fbLoader.hide();
}

//skip login if asked to do so
function goHome() {
  Ti.App.Properties.setBool('has_skipped_login', true);

  if (!showedMap) {
    Alloy.createController('index').getView().open();
  }

  $.login.close();
}