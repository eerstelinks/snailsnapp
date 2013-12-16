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

// check for fb_user_id, fb_access_token, fb_expiration_date
foreach ($requiredItems as $key => $item) {
  if (empty($item)) {
    $return['debug'] = 'no '.$key; // THIS RETURNS A NUMBER, ADRIAAN?
  }
}

if (!empty($error)) {
  $return['debug']  = implode(', ', $error);
  die(json_encode($return));
}

unset($insert);
$checkKeys = array(
  'fb_first_name'         => 'fb_first_name',
  'fb_full_name'          => 'fb_full_name',
  'fb_birthday'           => 'fb_birthday',
  'fb_email'              => 'fb_email',
  'fb_gender'             => 'fb_gender',
  'fb_location_id'        => 'fb_location_id',
  'fb_location_latitude'  => 'fb_location_latitude',
  'fb_location_longitude' => 'fb_location_longitude',
  'fb_timezone'           => 'fb_timezone',
  'fb_locale'             => 'fb_locale',
  'fb_last_modified'      => 'fb_last_modified',
);


foreach ($checkKeys as $databaseKey => $appKey) {
  if (!empty($app[$appKey])) {
    if ($databaseKey == 'fb_birthday') {
      $insert[$databaseKey] = date('Y-m-d', strtotime($app[$appKey]));
    }
    else {
      $insert[$databaseKey] = $app[$appKey];
    }
  }
}

$insert['fb_user_id']         = $app['always']['facebook']['user_id'];
$insert['fb_access_token']    = $app['always']['facebook']['access_token'];
$insert['fb_expiration_date'] = $app['always']['facebook']['expiration_date'];

// if ok, check database for exsisting user
$query  = "SELECT `fb_last_modified` FROM `users` WHERE `fb_user_id` = ".cf_quotevalue($app['always']['facebook']['user_id']);
$result = $mysqli->query($query);

if ($result->num_rows == 1) {

  $row = $result->fetch_assoc();

  // update record
  if (empty($app['fb_last_modified']) || (isset($app['fb_last_modified']) && date('Y-m-d H:i:s', strtotime($app['fb_last_modified'])) != $row['fb_last_modified'])) {

    $query = "UPDATE `users` SET ".cf_implode_mysqli($insert).", `last_modified` = NOW() WHERE `fb_user_id` = '".$app['always']['facebook']['user_id']."'";
    if ($mysqli->query($query)) {
      $return['status'] = 'success';
      die(json_encode($return));
    }
    else {
      $return['debug']  = 'MySql: query error while updating user';
      die(json_encode($return));
    }
  }
  else {
    $return['status'] = 'success';
    $return['debug']  = 'MySql: nothing updated';
    die(json_encode($return));
  }
}
elseif ($result->num_rows > 1) {

  $return['debug']  = 'MySql: Duplicate record of user';
  die(json_encode($return));
}
else {
  // create record
  $query = "INSERT INTO `users` SET ".cf_implode_mysqli($insert).", `last_modified` = NOW()";

  if ($mysqli->query($query)) {
    $return['status'] = 'success';
    die(json_encode($return));
  }
  else {
    $return['debug']  = 'MySql: query error while inserting user';
    die(json_encode($return));
  }
}

// return data back to the app
$return['debug']  = 'Script has reached the end of file';
echo json_encode($return);
?>