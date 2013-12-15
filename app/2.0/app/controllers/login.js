Ti.include('/js/update_user_info.js');

// is the map already loaded?
var showedMap = Ti.App.Properties.getBool('showed_map', false);

// get arguments from the previous controller
var args = arguments[0] || {};

// always destroy login when closed
$.login.addEventListener('close', function() {
  $.destroy();
});

function goToMapView() {

  if (!showedMap && Ti.App.Properties.getBool('send_back_to_post_photo', false) === false) {
    Alloy.createController('index').getView().open();
  }
  else if (Ti.App.Properties.hasProperty('send_back_to_post_photo')) {

    //var postphotoView = Ti.App.Properties.getObject('send_back_to_post_photo');
    Ti.App.Properties.removeProperty('send_back_to_post_photo');

    //postphotoView.open();
    alert('send to post photo: ' + args.data);
  }

  // set timeout so the indicater will show
  setTimeout(function(){
    $.login.close();
  }, 1500);
}

// show skip button when user has not skipped before
if (!Ti.App.Properties.getBool('has_skipped_login', true)) {
  $.skipLogin.show();
}
else {
  $.skipLogin.text = $.skipLogin.getText() + ' (only for dev)';
  $.skipLogin.show();
}

facebook.addEventListener('login', function(e) {

  if (e.success) {

    checkUserData();

    // hide logout button
    $.fbButton.hide();

    // hide skip, because you will get there sowieso
    $.skipLogin.hide();

    // show indicator of loading
    $.fbLoader.show();

    // get all facebook userdata
    facebook.requestWithGraphPath('me', {}, 'GET', function(e) {
      var user_data = JSON.parse(e.result);
      var object = {
        'FB accessToken : ': facebook.accessToken,
        'FB expirationDate : ': facebook.expirationDate,
        'FB uid : ': facebook.uid, // can be used to retrieve user profile pic (Facebook)
        'user_data': user_data
      };

      if (user_data.location && user_data.location.id) {
        // get longitude & latitude of current city user (facebook)
        facebook.requestWithGraphPath(user_data.location.id, {}, 'GET', function(e) {
          var location_data = JSON.parse(e.result);
          var locationObject = location_data.location;
          Ti.App.Properties.setObject('user_city_geolocation', locationObject);

          goToMapView();
        });
      }
      else {
        goToMapView();
      }

    });
  }
  else {
    showErrorAlert(e.error);
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