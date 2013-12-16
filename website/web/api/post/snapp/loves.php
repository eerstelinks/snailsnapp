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

$insert['user_id']    = $snailsnappUserID;
$insert['snapp_id']   = $app['snapp_id'];
$insert['rating']     = (int)$app['rating']; // converts to interval for mysql

// check if the record already exists
$checkExisting = $insert;
unset($checkExisting['rating']);
$query  = "SELECT `snapp_love_id`, `rating` FROM `snapp_loves` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');
$result = $mysqli->query($query);

if ($result->num_rows == 1) {
  // update
  $row = $result->fetch_assoc();
  // update record
  if ($app['rating'] != $row['rating']) {
    $query = "UPDATE `snapp_loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW() WHERE `snapp_love_id` = '".$row['snapp_love_id']."'";

    if ($mysqli->query($query)) {
      $return['status'] = 'success';
      die(json_encode($return));
    }
    else {
      $return['debug']  = 'MySql: query error while updating snapplove';
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
  $return['debug']  = 'MySql: Duplicate record of snapplove';
  die(json_encode($return));
}
else {
  // create record
  $query = "INSERT INTO `snapp_loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW()";

  if ($mysqli->query($query)) {
    $return['status'] = 'success';
    die(json_encode($return));
  }
  else {
    $return['debug']  = 'MySql: query error while inserting snapplove';
    die(json_encode($return));
  }
}


// return data back to the app
$return['debug']  = 'Script has reached the end of file';
die(json_encode($return));
?>