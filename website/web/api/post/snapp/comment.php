<?php
require(dirname(__FILE__).'/../../assets/api_init.php');
require(dirname(__FILE__).'/../../assets/verify_user.php');

if (empty($app['snapp_id'])) {
  $return['debug'] = 'no snapp_id';
  die(json_encode($return));
}

if (empty($app['comment'])) {
  $return['message'] = L('fill_in_message'); //SERVER: vul wel een bericht in.';
  die(json_encode($return));
}

unset($insert);
$insert['snapp_id']   = $app['snapp_id'];
$insert['comment']    = $app['comment'];
$insert['ss_user_id'] = $ss_user_id;

// check if the record already exists
$query  = "SELECT `snapp_comment_id` FROM `snapp_comments` WHERE ".cf_implode_mysqli($insert, null, ' AND ');
$result = $mysqli->query($query);

if ($result->num_rows > 0) {
  $return['message'] = L('double_comment');
  $return['debug']   = 'MySql: record already exists!';
  die(json_encode($return));
}

// all ok, create a database entry for the new comment!
$query = "INSERT INTO `snapp_comments` SET ".cf_implode_mysqli($insert).", `created` = NOW()";

if ($mysqli->query($query)) {

  $lastInsertId = $mysqli->insert_id;

  $query = "SELECT
      `snapp_comments`.`snapp_comment_id`,
      `snapp_comments`.`created`,
      `snapp_comments`.`comment`,
      `snapp_comments`.`total_comment_loves`,
      `users`.`fb_user_id`,
      `users`.`fb_full_name`
    FROM `snapp_comments`
    LEFT JOIN `users` ON `users`.`ss_user_id` = `snapp_comments`.`ss_user_id`
    WHERE `snapp_comment_id` = ".cf_quotevalue($lastInsertId);

  if ($res = $mysqli->query($query)) {

    $return = $res->fetch_assoc();
    $return['status'] = 'success';
    die(json_encode($return));
  }
  else {
    $return['debug'] = 'Could not get data back from database';
    die(json_encode($return));
  }
}
else {
  $return['debug']  = 'MySql: query error while inserting snapp comment';
  die(json_encode($return));
}


// return data back to the app
$return['debug']  = 'Script has reached the end of file';
die(json_encode($return));
?>