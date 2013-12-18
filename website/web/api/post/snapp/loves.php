<?php
require(dirname(__FILE__).'/../../assets/api_init.php');
require(dirname(__FILE__).'/../../assets/verify_user.php');

function updateTotalLoves($type, $typeId) {
  global $mysqli;

  // get the total counts
  $query = "SELECT SUM(`rating`) AS `total_rating` FROM `loves` WHERE `type` = ".cf_quotevalue($type)." AND `type_id` = ".cf_quotevalue($typeId);
  $res = $mysqli->query($query);
  $row = $res->fetch_assoc();
  $totalRating = $row['total_rating'];

  // update the total counts
  if ($type == 'comment') {
    $query = "UPDATE `snapp_comments` SET `total_comment_loves` = ".cf_quotevalue($totalRating)." WHERE `snapp_comment_id` = ".cf_quotevalue($typeId);
  }
  elseif ($type == 'snapp') {
    $query = "UPDATE `snapps` SET `total_snapp_loves` = ".cf_quotevalue($totalRating)." WHERE `snapp_id` = ".cf_quotevalue($typeId);
  }

  $mysqli->query($query);

  return $totalRating;
}

$return['status'] = 'error';

if (isset($_POST['data'])) {
  $app = json_decode(stripslashes($_POST['data']), true);
}
else {
  $return['debug'] = 'No post data';
  die(json_encode($return));
}

if (empty($app['type']) || empty($app['id']) || !isset($app['rating'])) {
  $return['debug'] = 'Type, id nor rating are not received';
  die(json_encode($return));
}

$checkExisting['ss_user_id'] = $ss_user_id;
$checkExisting['type']       = $app['type'];
$checkExisting['type_id']    = $app['id'];

$query = "SELECT `love_id` FROM `loves` WHERE ".cf_implode_mysqli($checkExisting, null, ' AND ');

if ($result = $mysqli->query($query)) {

  // if is 1, update the row
  if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $query = "UPDATE `loves` SET `rating` = ".$app['rating'].", `modified` = NOW() WHERE `love_id` = ".cf_quotevalue($row['love_id']);
  }
  // if > 1, error
  elseif ($result->num_rows > 1) {
    $return['debug'] = 'Duplicate love rows';
    die(json_encode($return));
  }
  // insert row
  else {
    $insert = $checkExisting;
    $insert['rating'] = $app['rating'];
    $query = "INSERT INTO `loves` SET ".cf_implode_mysqli($insert).", `modified` = NOW()";
  }

  if ($mysqli->query($query)) {
    $return['sum_rating'] = updateTotalLoves($app['type'], $app['id']);
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