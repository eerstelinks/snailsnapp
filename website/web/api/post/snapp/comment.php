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
  $app['snapp_id'],
  $app['comment']
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
  'created'           => 'created'
);

foreach ($checkKeys as $databaseKey => $appKey) {
  if (!empty($app[$appKey])) {
    $insert[$databaseKey] = $app[$appKey];
  }
  // if created is not received from app, use current datetime UTC
  else if ($databaseKey = 'created' && empty($app['created'])) {
    $app['created']    = date("Y-m-d H:i:s");
    $insert['created'] = $app['created'];
  }
}

$insert['snapp_id'] = $app['snapp_id'];
$insert['comment']  = $app['comment'];
$insert['ss_user_id']  = $ss_user_id; // SHOULD ALWAYS BE THERE

// check if the record already exists
$checkExisting = $insert;
unset($checkExisting['created']);
$query  = "SELECT `snapp_comment_id` FROM `snapp_comments` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');
$result = $mysqli->query($query);

if ($result->num_rows > 0) {
  $return['debug']  = 'MySql: record already exists!';
  die(json_encode($return));
}

// all ok, create a database entry for the new comment!
$query = "INSERT INTO `snapp_comments` SET ".cf_implode_mysqli($insert)."";

if ($mysqli->query($query)) {

  $lastInsertId = $mysqli->insert_id;

  $query = "SELECT
      `snapp_comments`.`created`,
      `snapp_comments`.`comment`,
      `users`.`fb_user_id`,
      `users`.`fb_full_name`
    FROM `snapp_comments`
    LEFT JOIN `users` ON `users`.`ss_user_id` = `snapp_comments`.`ss_user_id`
    WHERE `snapp_comment_id` = ".cf_quotevalue($lastInsertId);

  if ($res = $mysqli->query($query)) {

    $return = $res;
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