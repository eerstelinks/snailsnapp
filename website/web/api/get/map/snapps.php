<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');
require(dirname(__FILE__).'/../../assets/verify_user.php');

$query = "SELECT
  `snapp_id`,
  `url_pin`,
  `url_thumbnail`,
  `url_phone`,
  `url_tablet`,
  `description`,
  `latitude`,
  `longitude`,
  `created`,
  `total_snapp_loves`
FROM
  `snapps`
WHERE `status` = 'visible'
ORDER BY `created` DESC
LIMIT 0, 5";

if (!$res = $mysqli->query($query)) {

  $return['debug'] = 'MySql: query error';
  die(json_encode($return));
}

$return['result_count'] = $res->num_rows;

while ($row = $res->fetch_assoc()) {

  $return['annotations'][] = $row;
}

$return['status'] = 'success';
die(json_encode($return));

?>