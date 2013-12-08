<?php
require(dirname(__FILE__).'/../assets/json_header.php');

$return['status']  = 'error';

if (count($_POST) == 0) {
  $return['message'] = 'The server has nothing received from the app, try again later '.print_r($_POST, true).print_r($_GET, true);
  die(json_encode($return));
}
elseif (empty($_POST['email_friend'])) {
  $return['status'] = 'success';
  $return['message'] = 'Stay tuned, you will get your invite soon! You still can invite a friend, but you can\'t change your own email';
  echo json_encode($return);
}
else {
  $return['status'] = 'success';
  $return['message'] = 'Stay tuned, you will get your invite soon!';
  echo json_encode($return);
}

// send the data to our email
$extraInfo['added'] = date('Y-m-d H:i:s');
$allInfo = array_merge($extraInfo, $_POST);

mail('adriaan@eerstelinks.nl', 'nieuwe snailsnapp user', print_r($allInfo, true));
?>