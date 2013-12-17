<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');
require(dirname(__FILE__).'/../../assets/verify_user.php');

if (empty($app['snapp_id'])) {
  $return['debug'] = 'no snapp_id';
  die(json_encode($return));
}

// retrieve the comments
$query  = "SELECT
  `snapp_comments`.`snapp_comment_id`,
  `snapp_comments`.`created`,
  `snapp_comments`.`comment`,
  `snapp_comments`.`total_comment_loves`,
  `users`.`fb_user_id`,
  `users`.`fb_full_name`
 FROM `snapp_comments`
 LEFT JOIN `users` ON `users`.`ss_user_id` = `snapp_comments`.`ss_user_id`
 WHERE `snapp_id` = ".$app['snapp_id']." AND `status` = 'visible'";

if ($res = $mysqli->query($query)) {

  // get all comments
  while($row = $res->fetch_assoc()) {
    $return['comments'][] = $row;
  }

  // show comment count, even when it is 0
  $return['result_count'] = $res->num_rows;

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