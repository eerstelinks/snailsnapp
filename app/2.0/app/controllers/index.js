Ti.include('/js/upload.js');
Ti.include('/js/lib/cachedImageView.js');

//show map
$.mapview.showsPointsOfInterest = false;
$.mapview.userLocationButton = true;
$.mapview.traffic = false;

$.mapview.userLocation = true;

// when location services are off, get user city location from facebook, default to amsterdam
var showGeolocation = Ti.App.Properties.getObject('user_city_geolocation', { latitude: 52.373056, longitude: 4.892222 });

$.mapview.region = {
  latitude: showGeolocation.latitude,
  longitude: showGeolocation.longitude,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
};

// open viewPhoto after click on either thumbnail or pin
$.mapview.addEventListener('click', function(evt) {

  $.mapview.deselectAnnotation(evt.annotation);

  // open the view only when the user hits the pin
  // and not when deselectAnnotation() fires
  if (evt.clicksource != null) {
    Alloy.createController('viewphoto', { snapp: evt.annotation.snapp }).getView().open();
  }

});

function snailSwitch() {

  if (Ti.App.Properties.getBool('explained_maptype_switch', false) {
    Ti.App.Properties.setBool('explained_maptype_switch', true);
    showSuccessAlert(L('explain_maptype_message'), L('default_understand_button'), L('explain_maptype_title'));
  }

  var mapType = $.snailSwitch.getMapType();
  if (mapType == 'public') {
    $.snailSwitch.setImage('/images/icons/user.png');
    $.snailSwitch.setMapType('private');
  }
  else {
    $.snailSwitch.setImage('/images/icons/group.png');
    $.snailSwitch.setMapType('public');
  }

  $.mapview.removeAllAnnotations();
  $.mapview.fireEvent('regionchanged');
}

// open viewPhoto after click on either thumbnail or pin
$.mapview.addEventListener('regionchanged', function(evt) {

  // upload data to snailsnapp
  uploadToSnailsnapp(
    '/get/map/snapps',
    function(json) {
      if (json.result_count > 0) {
        showAnnotations(json.annotations);
      }
    },
    function(error) {
      // do nothing
    },
    {
      type: $.snailSwitch.getMapType(),
      latitude: evt.latitude,
      latitude_delta: evt.latitudeDelta,
      longitude: evt.longitude,
      longitude_delta: evt.longitudeDelta,
    }
  );

});

function showAnnotations(annotations) {

  for (key in annotations) {

    var annotation = annotations[key];

    var pinView = Ti.UI.createView({
      backgroundColor: Alloy.CFG.white,
      width: 48,
      height: 48,
      borderRadius: 3,
      borderColor: Alloy.CFG.black,
      borderWidth: 0.5,
    });

    var pinImageView = Ti.UI.createImageView({
      width: 40,
      height: 40,
      image: annotation.url_pin
    });

    pinView.add(pinImageView);

    var snapp = Alloy.Globals.Map.createAnnotation({
      latitude: annotation.latitude,
      longitude: annotation.longitude,
      title: L('loading') + '...',
      snapp: annotation,
      customView: pinView
    });

    // add the annotations
    $.mapview.addAnnotation(snapp);
  }
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