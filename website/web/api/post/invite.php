<?php
require(dirname(__FILE__).'/../assets/json_header.php');

$return['status']  = 'error';

if (count($_POST) == 0) {
  $return['message'] = 'Nothing received from the app, try again later';
  die(json_encode($return));
}

$return['status']  = 'success';
echo json_encode($return);

// send the data to our email
$extraInfo['added'] = date('Y-m-d H:i:s');
$allInfo = array_merge($extraInfo, $_POST);

mail('adriaan@eerstelinks.nl', 'nieuwe snailsnapp user', print_r($allInfo, true));
?>