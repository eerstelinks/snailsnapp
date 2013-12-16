<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');

// do not verify user, because it does not excist yet
$verifyUser = false;
require(dirname(__FILE__).'/../../assets/verify_user.php');

function registerDevice($ss_user_id, $app) {
  global $mysqli;

  // insert user id
  $insert['ss_user_id'] = $ss_user_id;

  // left database column, right post name from app
  $checkDeviceValue = array(
    'hash'             => 'hash',
    'platform'         => 'platform',
    'platform_version' => 'platform_version',
    'is_tablet'        => 'is_tablet',
  );

  // check if values exist, yes? add to insert
  foreach ($checkDeviceValue as $databaseColumn => $receivedValue) {
    if (!empty($app['always']['device'][$checkDeviceValue[$receivedValue]])) {
      $insert[$databaseColumn] = $app['always']['device'][$checkDeviceValue[$receivedValue]];
    }
  }

  // insert values from data about the app (other sub array)
  if (!empty($app['always']['app']['version'])) {
    $insert['app_version'] = $app['always']['app']['version'];
  }
  if (!empty($app['always']['app']['lang'])) {
    $insert['lang'] = $app['always']['app']['lang'];
  }

  // check if there is a apple_device_token_id
  if (!empty($app['apple_device_token_id'])) {
    $insert['apple_device_token_id'] = $app['apple_device_token_id'];
  }

  if (!empty($app['always']['device']['hash'])) {

    // select all devices with same apple_device_token_id
    $query  = "SELECT `user_device_id`
      FROM `user_devices`
      WHERE `hash` = ".cf_quotevalue($app['always']['device']['hash'])."
        AND `ss_user_id` = ".cf_quotevalue($ss_user_id);
    $result = $mysqli->query($query);

    // results found, update device row
    if ($result->num_rows == 1) {
      $row = $result->fetch_assoc();

      $query = "UPDATE `user_devices`
        SET ".cf_implode_mysqli($insert).", `last_modified` = NOW()
        WHERE `user_device_id` = ".cf_quotevalue($row['user_device_id']);
      return $mysqli->query($query);
    }
    // more than one row found, error!
    elseif ($result->num_rows > 1) {
      return false;
    }
    // put new row when nothing found
    else {
      $query = "INSERT INTO `user_devices` SET ".cf_implode_mysqli($insert).", `last_modified` = NOW()";
      return $mysqli->query($query);
    }
  }
}

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
  LIMIT 0, 2";
$result = $mysqli->query($query);

if ($result->num_rows == 1) {

  $row = $result->fetch_assoc();

  registerDevice($row['ss_user_id'], $app);

  // update record
  if (empty($app['fb_last_modified']) || (isset($app['fb_last_modified']) && date('Y-m-d H:i:s', strtotime($app['fb_last_modified'])) != $row['fb_last_modified'])) {

    // update only when access token is correct
    // check on facebook
    $checkTokenUrl = 'https://graph.facebook.com/me?access_token='.$app['always']['facebook']['access_token'];
    $contentToken  = file_get_contents($checkTokenUrl);

    if ($contentToken) {

      $tokenArray = json_decode($contentToken, true);

      if (isset($tokenArray['id']) && $tokenArray['id'] == $app['always']['facebook']['user_id']) {

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
    }

    $return['debug'] = 'Access token is invalid';
    die(json_encode($return));
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

    $lastInsertId = $mysqli->insert_id;
    registerDevice($lastInsertId, $app);

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