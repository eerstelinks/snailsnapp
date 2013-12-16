<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');

$return['status'] = 'error';

if (isset($_POST['data'])) {
  $app = json_decode(stripslashes($_POST['data']), true);
}
else {
  $return['debug'] = 'No post data';
  die(json_encode($return));
}

unset($insert);
$checkKeys = array(
  'description'       => 'description',
  'shared_facebook'   => 'shared_facebook',
  'shared_snailsnapp' => 'shared_snailsnapp',
  'shared_anonymous'  => 'shared_anonymous',
  'created'           => 'created'
);

foreach ($checkKeys as $databaseKey => $appKey) {
  if (!empty($app[$appKey])) {
    $insert[$databaseKey] = $app[$appKey];
  }
  // if created is not received from app, use current datetime UTC
  else if ($databaseKey = 'created' && empty($app['created'])) {
    $app['created']    = date("Y-m-d H:i:s");
    $insert['created'] = $app['created'];
  }
}

$insert['url_pin']        = $app['uploaded_urls']['20'];
$insert['url_thumbnail']  = $app['uploaded_urls']['200'];
$insert['url_phone']      = $app['uploaded_urls']['640'];
$insert['url_tablet']     = $app['uploaded_urls']['1536'];
$insert['latitude']       = $app['geolocation']['latitude'];
$insert['longitude']      = $app['geolocation']['longitude'];
$insert['ss_user_id']     = $ss_user_id; // SHOULD ALWAYS BE THERE

// check if the record already exists
$checkExisting = $insert;
unset($checkExisting['created']);
$query  = "SELECT `snapp_id` FROM `snapps` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');
$result = $mysqli->query($query);

if ($result->num_rows > 0) {
  $return['debug']  = 'MySql: record already exists!';
  die(json_encode($return));
}

// all ok, create a database entry for the new snapp!
$query = "INSERT INTO `snapps` SET ".cf_implode_mysqli($insert)."";

if ($mysqli->query($query)) {
  $return['status'] = 'success';
  die(json_encode($return));
}
else {
  $return['debug']  = 'MySql: query error while inserting snapp';
  die(json_encode($return));
}

// return data back to the app
$return['debug']  = 'Script has reached the end of file';
die(json_encode($return));
?>