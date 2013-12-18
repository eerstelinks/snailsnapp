<?php
require(dirname(__FILE__).'/../../assets/api_init.php');
require(dirname(__FILE__).'/../../assets/verify_user.php');

// this script is updating notification preferences altered in appsettings by the user

function updateNotificationPreferences($type, $typeId) {
  global $mysqli;

  // get the notification preferences
  $query = "SELECT * FROM `notification_permissions` WHERE `ss_user_id` = ".cf_quotevalue($ss_user_id);
  $res = $mysqli->query($query);
  $row = $res->fetch_assoc();
  $currentPreferences = $row;

  return $currentPreferences;
}

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
  'never'                    => 'never',
  'loves_my_snapp'           => 'loves_my_snapp',
  'loves_my_comment'         => 'loves_my_comment',
  'comments_my_snapp'        => 'comments_my_snapp',
  'comments_my_comment'      => 'comments_my_comment',
  'loves_comment_my_snapp'   => 'loves_comment_my_snapp',
  'loves_comment_my_comment' => 'loves_comment_my_comment',
  'snailsnapp_updates'       => 'snailsnapp_updates',
  'special_occasions'        => 'special_occasions'
);

foreach ($checkKeys as $databaseKey => $appKey) {
  if (!empty($app[$appKey])) {
    $insert[$databaseKey] = $app[$appKey];
  }
}

$query = "SELECT `permission_id` FROM `notification_permissions` WHERE `ss_user_id` = '".cf_quotevalue($ss_user_id);

if ($result = $mysqli->query($query)) {

  // if is 1, update the row
  if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $query = "UPDATE `notification_permissions` SET ".cf_implode_mysqli($insert).", `modified` = NOW() WHERE `ss_user_id` = ".cf_quotevalue($ss_user_id);
  }
  // if > 1, error
  elseif ($result->num_rows > 1) {
    $return['debug'] = 'Duplicate rows with notification preferences';
    die(json_encode($return));
  }
  // insert row
  else {
    $query = "INSERT INTO `notification_permissions` SET ".cf_implode_mysqli($insert).", `modified` = NOW()";
  }

  if ($mysqli->query($query)) {
    $return['status']     = 'success';
    die(json_encode($return));
  }
  else {
    $return['debug'] = 'Query failed: '.$query;
    die(json_encode($return));
  }

}
else {
  $return['debug'] = 'Can not run query: '.$query;
  die(json_encode($return));
}

// return data back to the app
$return['debug']  = 'Script has reached the end of file';
die(json_encode($return));
?>