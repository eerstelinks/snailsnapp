<?php

require(dirname(__FILE__).'/../../assets/json_header.php');

$data = json_decode(stripslashes($_POST['data']), true);

$return['status'] = 'success';
$return['post']   = $data;
echo json_encode($return);

?>