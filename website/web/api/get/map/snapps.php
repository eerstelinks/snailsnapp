<?php
$api_init_required_keys = array('latitude', 'latitude_delta', 'longitude', 'longitude_delta');
require(dirname(__FILE__).'/../../assets/api_init.php');

// first we check if there is a type
if (empty($app['type'])) {
  $app['type'] = 'public';
}

// if it is public, then a facebook login is not required
if ($app['type'] == 'public') {
  $loginNotRequired = true;  // watch out, user id can be 0!!!
}

$where = '';

// measure map view
$geo['latitude_from']  = $app['latitude']  - $app['latitude_delta'];
$geo['latitude_to']    = $app['latitude']  + $app['latitude_delta'];
$geo['longitude_from'] = $app['longitude'] - $app['longitude_delta'];
$geo['longitude_to']   = $app['longitude'] + $app['longitude_delta'];

$where .= " AND `latitude` >= ".cf_quotevalue($geo['latitude_from']);
$where .= " AND `latitude` <= ".cf_quotevalue($geo['latitude_to']);
$where .= " AND `longitude` >= ".cf_quotevalue($geo['longitude_from']);
$where .= " AND `longitude` <= ".cf_quotevalue($geo['longitude_to']);

// go verify the user, when it is logged in
require(dirname(__FILE__).'/../../assets/verify_user.php');

// if type if private, show only private snapps
if ($app['type'] == 'private') {
  $where .= " AND `snapps`.`ss_user_id` = ".cf_quotevalue($ss_user_id);
}
else {
  $where .= " AND `shared_snailsnapp` = 1";
}

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
 WHERE `status` = 'visible' ".$where."
ORDER BY `created` DESC
LIMIT 0, 20";

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