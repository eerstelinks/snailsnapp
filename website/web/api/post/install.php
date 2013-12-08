<?php
require(dirname(__FILE__).'/../assets/json_header.php');

$releaseDate = '2014-01-16 18:00:00';

$return['status']  = 'success';
$return['release_date'] = date('Y/m/d H:i:s', strtotime($releaseDate));

echo json_encode($return);

if (count($_POST) > 0) {

  // send the data to our email
  $extraInfo['added'] = date('Y-m-d H:i:s');
  $allInfo = array_merge($extraInfo, $_POST);

  mail('adriaan@eerstelinks.nl', 'nieuwe snailsnapp install', print_r($allInfo, true));
}
?>

