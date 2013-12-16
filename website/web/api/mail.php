<?php

$app = array();
if (isset($_POST['data'])) {
  $app = json_decode(stripslashes($_POST['data']), true);
}

mail('info@snailsnapp.com', 'post, get en app', print_r($_POST, true)."\n\n\n".print_r($_GET, true)."\n\n\n".print_r($app, true));

?>