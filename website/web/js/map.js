src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDl9MCsn7lVAV69CkVvvo6hDg2YDV1ScV0&sensor=true"

var mapOptions = {
  zoom: 8
};

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

function initialize() {

  var snapps = [];

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  }
  else {
    // browser does not support geolocation
    var mapOptions = {
      center: new google.maps.LatLng(52.373056, 4.892222),
      zoom: 6
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  }
  google.maps.event.addListener(map, 'idle', function() {
    setMarkers(map,snapps);
  });
}

function handleNoGeolocation() {
  // zoom to Amsterdam on a higher zoomlevel
  console.log('ii');
  var options = {
    map: map,
    position: new google.maps.LatLng(52.373056, 4.892222),
    zoom: 6
  };

  map.setCenter(options.position);
  map.setZoom(options.zoom);
}

// put snapps on the map
function setMarkers(map, snapps) {

  // get the boundaries of the visible map
  var bounds              = map.getBounds();
  var NE                  = bounds.getNorthEast();
  var SW                  = bounds.getSouthWest();

  // define the boundaries to retrieve the snapps
  var map_latitude        = SW.nb;
  var map_latitude_delta  = (NE.nb - SW.nb);
  var map_longitude       = SW.ob;
  var map_longitude_delta = (NE.ob - SW.ob);
  var map_type            = 'public';

  // get the snapps
  $.getJSON( "/api/get/map/snapps?latitude=" + map_latitude + "&latitude_delta=" + map_latitude_delta + "&longitude=" + map_longitude + "&longitude_delta= " + map_longitude_delta + "&type=" + map_type, function(snapps) {
    if (snapps.result_count > 0) {
      for (var i = 0; i < snapps.result_count; i++) {

        var snapp           = snapps.annotations[i];
        var snapp_marker    = snapp.url_pin;

        var snapp_latLng    = new google.maps.LatLng(snapp.latitude, snapp.longitude);
        var marker          = new RichMarker({
          position: snapp_latLng,
          map:      map,
          shadow:   0,
          content:  '<img class="snapp_marker" src="' + snapp_marker + '" />'
        });
      }
    }
    else {
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
