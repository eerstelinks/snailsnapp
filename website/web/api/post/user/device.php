<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');

$return['status'] = 'error';

if (isset($_POST['data'])) {
  $app = json_decode(stripslashes($_POST['data']), true);
}
else {
  // SAMPLE DATA!

  $app['always']['facebook']['user_id'] = '1';
  $app['always']['facebook']['access_token'] = '2';
  $app['always']['facebook']['expiration_date'] = '3';
  $snailsnappUserID = '4';
  //$app['platform'] = 'ios';
  //$app['platform_version'] = '7.0.3';
  //$app['is_tablet'] = false;
  //$app['app_version'] = '2.0';


  //$return['debug'] = 'No post data';
  //die(json_encode($return));
}

// check data from the app
if (empty($app['always']['facebook'])) {
  $return['debug']  = 'no data';
  die(json_encode($return));
}

// required items
$requiredItems = array(
  $app['always']['facebook']['user_id'],
  $app['always']['facebook']['access_token'],
  $app['always']['facebook']['expiration_date'],
);

// check for required items
foreach ($requiredItems as $key => $item) {
  if (empty($item)) {
    $return['debug'] = 'no '.$key; // THIS RETURNS A NUMBER, ADRIAAN?
    die(json_encode($return));
  }
}

if (!empty($error)) {
  $return['debug']  = implode(', ', $error);
  die(json_encode($return));
}

unset($insert);
$checkKeys = array(
  'platform'         => 'platform',
  'platform_version' => 'platform_version',
  'is_tablet'        => 'is_tablet',
  'app_version'      => 'app_version'
);

foreach ($checkKeys as $databaseKey => $appKey) {
  if (!empty($app[$appKey])) {
    $insert[$databaseKey] = $app[$appKey];
  }
}

$insert['user_id'] = $snailsnappUserID; // SHOULD ALWAYS BE THERE
if (count($insert) == 1) {
  $return['debug'] = 'Only 1 element in Array';
  die(json_encode($return));
}

// check if the record already exists
// I NEED SOMETHING UNIQUE HERE, DEVICE ID???
$checkExisting = $insert;
unset($checkExisting['user_id']);
$query  = "SELECT `user_device_id` FROM `user_devices` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');
$result = $mysqli->query($query);

if ($result->num_rows > 0) {
  // update record
  $return['debug']  = 'MySql: record already exists!';
  die(json_encode($return));
}

// create a database entry for the new device
$query = "INSERT INTO `user_devices` SET ".cf_implode_mysqli($insert)."";

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