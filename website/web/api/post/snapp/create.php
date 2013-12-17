<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');
require(dirname(__FILE__).'/../../assets/verify_user.php');

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
  else if ($databaseKey == 'created' && empty($app['created'])) {
    $insert['created'] = date("Y-m-d H:i:s");
  }
}

// set convert sizes, the may change in the future
$convertSizes = array(
  '80'   => 'url_pin',
  '200'  => 'url_thumbnail',
  '640'  => 'url_phone',
  '1536' => 'url_tablet'
);

// trow error when urls received are unequal to urls expected
if (!isset($app['uploaded_urls']) || (isset($app['uploaded_urls']) && (count($app['uploaded_urls']) != count($convertSizes)))) {
  $return['debug'] = 'Expected '.count($convertSizes).' urls in uploaded_urls';
  die(json_encode($return));
}

// add urls to insert when they excist
foreach ($convertSizes as $pixels => $columnName) {
  if (!empty($app['uploaded_urls'][$pixels])) {
    $insert[$columnName] = $app['uploaded_urls'][$pixels];
  }
  else {
    $urlErrors[] = $pixels.'px ('.$columnName.')';
  }
}

// trow error whitch url are empty
if (isset($urlErrors)) {
  $return['debug'] = 'Did not found this sizes of the url: '.implode($urlErrors);
  die(json_encode($return));
}

// check for geo coordinates
if (empty($app['geolocation']['latitude']) || empty($app['geolocation']['longitude'])) {
  $return['debug'] = 'No geolocation provided';
  die(json_encode($return));
}
else {
  $insert['latitude']  = $app['geolocation']['latitude'];
  $insert['longitude'] = $app['geolocation']['longitude'];
}

$insert['ss_user_id'] = $ss_user_id;

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
$query = "INSERT INTO `snapps` SET ".cf_implode_mysqli($insert);

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