<?php
require(dirname(__FILE__).'/../../assets/api_init.php');

$loginNotRequired = true;  // watch out, user id can be 0!!!
require(dirname(__FILE__).'/../../assets/verify_user.php');

if (empty($app['snapp_id'])) {
  $return['debug'] = 'no snapp_id';
  die(json_encode($return));
}

$query = "SELECT `total_snapp_loves`, IFNULL(`rating`, 0) AS `rating`
  FROM `snapps`
  LEFT JOIN `loves` ON `loves`.`type_id` = `snapps`.`snapp_id` AND `loves`.`type` = 'snapp' AND `loves`.`ss_user_id` = ".cf_quotevalue($ss_user_id)."
  WHERE `snapp_id` = ".cf_quotevalue($app['snapp_id'])." AND `status` = 'visible'";

$return['total_snapp_loves']   = false;
$return['current_user_rating'] = false;

if ($res = $mysqli->query($query)) {
  if ($res->num_rows == 1) {
    $row = $res->fetch_assoc();
    $return['total_snapp_loves']   = $row['total_snapp_loves'];
    $return['current_user_rating'] = $row['rating'];
  }
  else {
    $return['debug'] = 'total_snapp_loves return false';
  }
}

// retrieve the comments
$query = "SELECT
  `snapp_comments`.`snapp_comment_id`,
  `snapp_comments`.`created`,
  `snapp_comments`.`comment`,
  `snapp_comments`.`total_comment_loves`,
  `users`.`fb_user_id`,
  `users`.`fb_full_name`,
  IFNULL(`loves`.`rating`, 0) AS `current_user_rating`
  FROM `snapp_comments`
  LEFT JOIN `users` ON `users`.`ss_user_id` = `snapp_comments`.`ss_user_id`
  LEFT JOIN `loves` ON `loves`.`type_id` = `snapp_comments`.`snapp_comment_id` AND `loves`.`type` = 'comment' AND `loves`.`ss_user_id` = ".cf_quotevalue($ss_user_id)."
  WHERE `snapp_id` = ".cf_quotevalue($app['snapp_id'])." AND `status` = 'visible'";

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