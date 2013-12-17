//show map
$.mapview.showsPointsOfInterest = false;
$.mapview.userLocationButton = true;
$.mapview.traffic = false;

$.mapview.userLocation = true;

// when location services are off, get user city location from facebook, default to amsterdam
var showGeolocation = Ti.App.Properties.getObject('user_city_geolocation', { latitude: 52.373056, longitude: 4.892222 });

// default map of Amsterdam
$.mapview.region = {
  latitude: showGeolocation.latitude,
  longitude: showGeolocation.longitude,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
};

// open viewPhoto after click on either thumbnail or pin
$.mapview.addEventListener('click', function(evt) {

  $.mapview.deselectAnnotation(snapp);

  // open the view only when the user hits the pin
  // and not when deselectAnnotation() fires
  if (evt.clicksource != null) {
    Alloy.createController('viewphoto', { snapp: { snapp_id: evt.annotation.snappId } }).getView().open();
  }

});

// open viewPhoto after click on either thumbnail or pin
$.mapview.addEventListener('regionchanged', function(evt) {

  //alert('region changed: '+ JSON.stringify(evt));

});

// include js library for caching thumbnails
Ti.include('/js/lib/cachedImageView.js');

if (true) {

  // give annotations to the map
  // Rabat: 34.033333, -6.833333
  var snappLatitude    = 34.033333;
  var snappLongtitude  = -6.833333;

  var newView = Ti.UI.createView({
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 3,
    borderColor: 'black',
    borderWidth: 0.5,
  });

  var newImageView = Ti.UI.createImageView({
    width: 40,
    height: 40
  });

  // replace image-annotation with cached thumbnail
  //var snappURL = 'https://snapps.s3.amazonaws.com/users/adriaan/20/1387250014_vx1t64.jpg?versionId=GYX7EYL8wPTptuDDi5uug1vEJc0jsPRw';
  var snappURL = 'https://snapps.s3.amazonaws.com/users/adriaan/200/1387250014_dt5ia5.jpg?versionId=tQMEs3AwsMnBq3DzyPgOaIFW5rTYS3Jw';
  cachedImageView('cached_pins', snappURL, newImageView);

  newView.add(newImageView);

  var snapp = Alloy.Globals.Map.createAnnotation({
    latitude: snappLatitude,
    longitude: snappLongtitude,
    title: L('loading') + '...',
    snappId: 1,
    customView: newView
  });


  // add the annotations
  $.mapview.addAnnotation(snapp);
}

function setLocation(coords){
  var region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    animate: true,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  };
  $.mapview.setLocation(region);
}

function locateMe() {
  if (Ti.Geolocation.locationServicesEnabled) {
    Ti.Geolocation.purpose = L('geo_own_location_purpose');
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
    Ti.Geolocation.distanceFilter = 10;
    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;

    Ti.Geolocation.getCurrentPosition(function(e) {
      if (e.error) {
        showErrorAlert(L('geo_no_location_message'), L('geo_no_location_button'));
      } else {
        setLocation(e.coords);
      }
    });
  }
}

function fbLogOut() {
  facebook.logout();
  Alloy.createController('login').getView().open();
}

// got to controller and trigger camera while hitting the snailHome
function snailHome() {
  if (Ti.Media.isCameraSupported) {

    if (typeof postView != 'object') {
      postView = Alloy.createController('postphoto', { mapView: $ }).getView();
      postView.open();
    }
    else {

      // check if postView is closed
      if (Ti.App.Properties.getBool('is_upload_active', false)) {
        postView.show();
      }
      else {
        postView = Alloy.createController('postphoto', { mapView: $ }).getView();
        postView.open();
      }
    }
  }
  else {
    showErrorAlert(L('no_camera_error_message'), L('no_camera_error_button'));
  }
}

//go to login screen when user is not logged in
var has_skipped_login = Ti.App.Properties.getBool('has_skipped_login', false);

if (!has_skipped_login && facebook.getLoggedIn() === false) {
  Ti.App.Properties.setBool('showed_map', false);

  Alloy.createController('login').getView().open();
}
else {
  Ti.App.Properties.setBool('showed_map', true);

  $.index.open();
  locateMe();
}