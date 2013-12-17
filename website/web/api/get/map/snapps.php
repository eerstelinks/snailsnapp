<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');

$loginNotRequired = true;  // watch out, user id can be 0!!!
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
  `shared_anonymous`,
  `total_snapp_loves`,
  `users`.`fb_user_id`,
  `users`.`fb_full_name`,
  IFNULL(`loves`.`rating`, 0) AS `current_user_rating`
FROM
  `snapps`
LEFT JOIN `loves` ON `loves`.`type_id` = `snapps`.`snapp_id` AND `loves`.`type` = 'snapp' AND `loves`.`ss_user_id` = ".cf_quotevalue($ss_user_id)."
LEFT JOIN `users` ON `users`.`ss_user_id` = `snapps`.`ss_user_id`
WHERE `status` = 'visible'
ORDER BY `created` DESC
LIMIT 0, 5";

if (!$res = $mysqli->query($query)) {

  $return['debug'] = 'MySql: query error';
  die(json_encode($return));
}

$return['result_count'] = $res->num_rows;

while ($row = $res->fetch_assoc()) {

  if ($row['shared_anonymous'] == 1) {
    unset($row['fb_user_id']);
    unset($row['fb_full_name']);
  }

  $return['annotations'][] = $row;
}

$return['status'] = 'success';
die(json_encode($return));

?>