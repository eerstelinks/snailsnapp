<?php

require(dirname(__FILE__).'/init.php');
require(dirname(__FILE__).'/json_header.php');

$return['status'] = 'error';

if (isset($_POST['data'])) {
  $app = json_decode(stripslashes($_POST['data']), true);

  if (!empty($app['always']['app']['lang'])) {
    $displayLang = $app['always']['app']['lang'];
  }
}
elseif (count($_GET) > 0) {
  $app = $_GET;

  if (!empty($app['always']['app']['lang'])) {
    $displayLang = $app['always']['app']['lang'];
  }
}


// check if required keys are set and exists
if (isset($api_init_required_keys) && is_array($api_init_required_keys)) {

  if (!isset($app)) {

    $return['debug'] = 'api_init_required_keys set, but no app data';
    die(json_encode($return));
  }

  foreach ($api_init_required_keys as $key) {

    // error when required key does not exists
    if (empty($app[$key])) {
      $return['debug'] = 'api_init_required_keys set, required: '.$key;
      die(json_encode($return));
    }
  }
}

?>