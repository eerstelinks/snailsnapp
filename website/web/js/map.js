src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDl9MCsn7lVAV69CkVvvo6hDg2YDV1ScV0&sensor=true"

function showLocaleDate(utc) {
  var date = new Date(utc);
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  return date.getDate() + ' ' + monthNames [date.getMonth()] + ' ' + date.getFullYear() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10?'0':'') + date.getMinutes();
}

var mapOptions = {
  zoom: 8
};

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

function initialize() {

  var snapps = [];

  // try HTML5 geolocation
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
  var markers              = [];

  // get the snapps
  $.getJSON("/api/get/map/snapps?latitude=" + map_latitude + "&latitude_delta=" + map_latitude_delta + "&longitude=" + map_longitude + "&longitude_delta= " + map_longitude_delta + "&type=" + map_type, function(snapps) {
    if (snapps.result_count > 0) {
      for (i = 0; i < snapps.result_count; i++) {

        // source: http://stackoverflow.com/a/13560751
        (function (i) {

          // build the beautiful marker
          var snapp           = snapps.annotations[i];
          var snapp_marker    = snapp.url_pin;
          var snapp_latLng    = new google.maps.LatLng(snapp.latitude, snapp.longitude);
          var marker          = new RichMarker({
            snapp:    snapp,
            position: snapp_latLng,
            map:      map,
            shadow:   0,
            content:  '<img class="snapp_marker" src="' + snapp_marker + '" />'
          });

          // listen for click event
          google.maps.event.addListener(marker, 'click', function() {
            viewSnapp(marker);
          });

        }) (i);
      }
    }
  });
}

function viewSnapp(marker) {
  // display snapp information
  $('#fb_profile_pic').attr('src', 'http://graph.facebook.com/' + marker.snapp.fb_user_id + '/picture?width=120&height=120');
  $('#fb_full_name').html(marker.snapp.fb_full_name);
  $('#snapp_created').html(showLocaleDate(marker.snapp.created));;
  $('#snapp_description').html(marker.snapp.description);
  // display the snapp itself
  $('#snapp_image').attr('src', marker.snapp.url_tablet);
  // display total loves
  if (marker.snapp.total_snapp_loves > 0) {
    $('#image_love').html('<i class="fa fa-heart"></i> ' + marker.snapp.total_snapp_loves + ' x');
  }
  else {
    $('#image_love').html('<i class="fa fa-heart-o"></i> 0 x');
  }
  // get the comments
  $.getJSON("/api/get/snapp/metadata?snapp_id=" + marker.snapp.snapp_id, function(metadata) {

    // empty the comment_wrapper first to remove old data
    $('#comment_wrapper').html('');
    if (metadata.comments) {
      for (i= 0; i < metadata.result_count; i++) {
        var comment      = metadata.comments[i];
        var comment_love = '<i class="fa fa-heart-o"</i> 0 x';
        if (comment.total_comment_loves > 0) {
          comment_love = '<i class="fa fa-heart"></i> ' + comment.total_comment_loves + ' x';
        }
        var datetime     = showLocaleDate(comment.created);
        // fill with the new comments
        $('#comment_wrapper').append('<div class="separator"></div><div class="snapp_info">' +
          '<img id="fb_profile_pic" src="http://graph.facebook.com/' + comment.fb_user_id + '/picture?width=120&height=120" />' +
          '<div class="snapp_details">' +
            '<p id="fb_full_name">' + comment.fb_full_name + '</p>' +
            '<p id="snapp_created">' + datetime + '</p>' +
            '<p id="snapp_description">' + comment.comment + '</p>' +
            '<p id="comment_love">' + comment_love + '</p>' +
          '</div>' +
        '</div>');
      }
    }
  });
  // show snapp container
  showViewSnapp();
  //$('#snapp_container').show();
}

$('#close_container').on('click', function(){
  closeViewSnapp();
});

function showViewSnapp() {
  var containerWidth = '300px';
  if ($('#snapp_container').width() == 0) {
    $('#snapp_container').animate({width: containerWidth}, 'slow', function() {$('#close_container').show()});
  }
}

function closeViewSnapp() {
  $('div#snapp_container').animate({width: 0}, 'slow');
  $('#close_container').hide();
}

google.maps.event.addDomListener(window, 'load', initialize);
