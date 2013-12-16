<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');

// do not verify user, because it does not excist yet
$verifyUser = false;
require(dirname(__FILE__).'/../../assets/verify_user.php');

unset($insert);
$checkKeys = array(
  'fb_first_name'         => 'first_name',
  'fb_full_name'          => 'name',
  'fb_birthday'           => 'birthday',
  'fb_email'              => 'email',
  'fb_gender'             => 'gender',
  'fb_timezone'           => 'timezone',
  'fb_locale'             => 'locale',
  'fb_last_modified'      => 'updated_time',
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

if (!empty($app['location']['id'])) {
  $insert['fb_location_id'] = $app['location']['id'];

  $locationUrl = 'https://graph.facebook.com/'.$app['location']['id'];
  $content = file_get_contents($locationUrl);

  if ($content) {
    $fbLocationArray = json_decode($content, true);
    if (!empty($fbLocationArray['location']['latitude']) && !empty($fbLocationArray['location']['longitude'])) {
      $insert['fb_location_latitude']  = $return['show_latitude']  = $fbLocationArray['location']['latitude'];
      $insert['fb_location_longitude'] = $return['show_longitude'] = $fbLocationArray['location']['longitude'];
    }
  }
}

$insert['fb_user_id']         = $app['always']['facebook']['user_id'];
$insert['fb_access_token']    = $app['always']['facebook']['access_token'];
$insert['fb_expiration_date'] = $app['always']['facebook']['expiration_date'];

// if ok, check database for exsisting user
$query = "SELECT `ss_user_id`, `fb_last_modified`
  FROM  `users`
  WHERE `fb_user_id` LIKE  ".cf_quotevalue($app['always']['facebook']['user_id'])."
    AND `fb_access_token` LIKE  ".cf_quotevalue($app['always']['facebook']['access_token'])."
    AND `fb_expiration_date` > NOW()
  LIMIT 0, 2";
$result = $mysqli->query($query);

if ($result->num_rows == 1) {

  $row = $result->fetch_assoc();

  // update record
  if (empty($app['fb_last_modified']) || (isset($app['fb_last_modified']) && date('Y-m-d H:i:s', strtotime($app['fb_last_modified'])) != $row['fb_last_modified'])) {

    $query = "UPDATE `users` SET ".cf_implode_mysqli($insert).", `last_modified` = NOW() WHERE `fb_user_id` = ".cf_quotevalue($app['always']['facebook']['user_id']);
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