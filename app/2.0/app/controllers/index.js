// show map
$.mapview.showsPointsOfInterest = false;
$.mapview.userLocationButton = false;
$.mapview.traffic = false;

$.mapview.userLocation = true;

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
  if (facebook.getLoggedIn() === false) {
    Alloy.createController('login').getView().open();
  }
  else {
    facebook.logout();
  }
}

//trigger camera after hitting the snailHome
function snailHome() {
  Ti.Media.showCamera({
    success:function(e) {
      Alloy.createController('postphoto', { image: 'Camera success description' }).getView().open();
    },
    error:function(e) {

      if (error.code == Titanium.Media.NO_CAMERA) {
        console.log('skip camera, use default image');
        Alloy.createController('postphoto', { image: 'Camera success description' }).getView().open();

        //showErrorAlert(L('other_camera_error_message'));
      }
      else {
        showErrorAlert(L('no_camera_error_message'));
      }


    },
    allowEditing: false,
    saveToPhotoGallery: true,
    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
  });
}

// go to login screen when user is not logged in
if (facebook.getLoggedIn() === false) {
  fbLogOut();
}
else {
  $.index.open();
}

/*
Ti.include('/js/upload-to-s3.js');

var name = 'local_overwrite.txt';
var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, name);
file.write('bestand 2');

//var name = 'local_overwrite.jpg';
//var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + 'images/test.jpg');
//var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + 'images/test_high_res.jpg');

upload(name, file,
  function(object) {
    console.log('success upload callback function: ' + object.url);
  },
  function(object) {
    console.log('fail upload callback function');
    alert(object);
  }
);
*/