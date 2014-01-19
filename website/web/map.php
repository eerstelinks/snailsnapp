<!DOCTYPE html>
<html>
  <head>
    <!-- favicon -->
    <link rel="shortcut icon" type="image/x-icon" href="/images/favicon.ico">
    <!-- font awesome -->
    <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
    <!-- css -->
    <link href="style/css/map.css" rel="stylesheet" />
    <!-- required for Google Maps -->
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />

    <!-- Google Maps API Key -->
    <script type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDl9MCsn7lVAV69CkVvvo6hDg2YDV1ScV0&amp;sensor=true">
    </script>
  </head>

  <body>

    <div id="map-canvas"></div>
    <div id="close_container"><i class="fa fa-times-circle fa-lg"></i></div>
    <div id="snapp_container">
      <div class="snapp_info">
        <img id="fb_profile_pic" />
        <div class="snapp_details">
          <p id="fb_full_name"></p>
          <p id="snapp_created"></p>
          <p id="snapp_description"></p>
        </div>
      </div>
      <div class="snapp_image">
        <img id="snapp_image" />
        <p id="image_love"></p>
      </div>

      <!-- IF COMMENTS ARE AVAILABLE PLACE THEM HERE -->
      <div id="comment_wrapper">
      </div>
    </div>
    <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="js/map.js"></script>
    <script src="js/richmarker.js"></script>
  </body>
</html>