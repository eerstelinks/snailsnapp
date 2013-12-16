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

// love can be given to either a snapp or a snapp_comment
unset($loveGivenTo);
if (isset($app['snapp_id']) && isset($app['snapp_comment_id'])) {
  $return['debug'] = 'Not specified where love should be given #1';
  die(json_encode($return));
}
elseif (isset($app['snapp_id'])) {
  $loveGivenTo = 'snapp_id';
}
elseif (isset($app['snapp_comment_id'])) {
  $loveGivenTo = 'snapp_comment_id';
}
else {
  $retun['debug'] = 'Not specified where love should be given #2';
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
  $app[$loveGivenTo]
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
$insert[$loveGivenTo] = $app[$loveGivenTo];
$insert['rating']     = (int)$app['rating']; // converts to interval for mysql

// check if the record already exists
$checkExisting = $insert;
unset($checkExisting['rating']);

if (isset($app['snapp_id'])) {
  $query  = "SELECT `snapp_love_id`, `rating` FROM `snapp_loves` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');
}
elseif (isset($app['snapp_comment_id'])) {
    $query  = "SELECT `snapp_comment_love_id`, `rating` FROM `snapp_comment_loves` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');
}
else {
  $return['debug']  = 'Not specified where love should be given #3';
  die(json_encode($return));
}

$result = $mysqli->query($query);

if ($result->num_rows == 1) {
  $row = $result->fetch_assoc();
  // update the record, cause it already exists
  if ($app['rating'] != $row['rating']) {
    if (isset($app['snapp_id'])) {
      $query = "UPDATE `snapp_loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW() WHERE `snapp_love_id` = '".$row['snapp_love_id']."'";
    }
    elseif (isset($app['snapp_comment_id'])) {
      $query = "UPDATE `snapp_comment_loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW() WHERE `snapp_comment_love_id` = '".$row['snapp_comment_love_id']."'";
    }
    else {
      $return['debug']  = 'Not specified where love should be given #4';
      die(json_encode($return));
    }

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
  if (isset($app['snapp_id'])) {
    $query = "INSERT INTO `snapp_loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW()";
  }
  elseif (isset($app['snapp_comment_id'])) {
    $query = "INSERT INTO `snapp_comment_loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW()";
  }
  else {
    $retun['debug'] = 'Not specified where love should be given';
    die(json_encode($return));
  }
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