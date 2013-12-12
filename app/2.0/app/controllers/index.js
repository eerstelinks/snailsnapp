//show map
$.mapview.showsPointsOfInterest = false;
$.mapview.userLocationButton = false;
$.mapview.traffic = false;

$.mapview.userLocation = true;

// default map of Amsterdam
$.mapview.region = {
  latitude: 52.373056,
  longitude: 4.892222,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
};

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
    Ti.Geolocation.purpose = L('geo_own_location_purpose', 'Get Current Location');
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
  Alloy.createController('login').getView();
}

// got to controller and trigger camera while hitting the snailHome
function snailHome() {
  if (Ti.Media.isCameraSupported) {
    Alloy.createController('postphoto', { showCamera: true }).getView().open();
  }
  else {
    showErrorAlert(L('no_camera_error_message'), L('no_camera_error_button'));
  }
}

//go to login screen when user is not logged in
var has_skipped_login = Ti.App.Properties.getBool('has_skipped_login', false);

if (!has_skipped_login && facebook.getLoggedIn() === false) {
  Alloy.createController('login').getView().open();
}
else {
  $.index.open();
  locateMe();
}