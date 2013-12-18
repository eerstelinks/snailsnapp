<?php
require(dirname(__FILE__).'/../../assets/api_init.php');

$loginNotRequired = true;  // watch out, user id can be 0!!!
require(dirname(__FILE__).'/../../assets/verify_user.php');

// retrieve the notification settings
$query  = "SELECT
  `never`,
  `loves_my_snapp`,
  `loves_my_comment`,
  `comments_my_snapp`,
  `comments_my_comment`,
  `loves_comment_my_snapp`,
  `loves_comment_my_comment`,
  `snailsnapp_updates`,
  `special_occasions`
 FROM `notification_permissions`
 WHERE `ss_user_id` = ".cf_quotevalue($ss_user_id);

if ($res = $mysqli->query($query)) {

  // get all settings
  while($row = $res->fetch_assoc()) {
    $return['notification_settings'] = $row;
  }
  // show settings count, even when it is 0
  $return['has_result'] = $res->num_rows;

  $return['status'] = 'success';
  die(json_encode($return));
}
else {
  $return['debug'] = 'Could not get data back from database';
  die(json_encode($return));
}

// return data back to the app
$return['debug']  = 'Script has reached the end of file';
die(json_encode($return));
?>