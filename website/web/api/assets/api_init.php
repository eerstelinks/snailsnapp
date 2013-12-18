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

?>