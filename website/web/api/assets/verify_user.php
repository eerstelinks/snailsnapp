<?php

$return['status'] = 'error';

if (isset($_POST['data'])) {
  $app = json_decode(stripslashes($_POST['data']), true);
}
else {
  $return['debug'] = 'No post data';
  die(json_encode($return));
}

// required items
if (empty($app['always']['facebook']['user_id'])) {
  $error[] = 'always.facebook.user_id not received';
}
if (empty($app['always']['facebook']['access_token'])) {
  $error[] = 'always.facebook.access_token not received';
}
if (empty($app['always']['facebook']['expiration_date'])) {
  $error[] = 'always.facebook.expiration_date not received';
}

if (!empty($error)) {
  $return['debug']  = implode(', ', $error);
  die(json_encode($return));
}

if (!isset($verifyUser) || (isset($verifyUser) && $verifyUser === true)) {
  // check if facebook access_token is valid
  $query = "SELECT `ss_user_id`
    FROM  `users`
    WHERE `fb_user_id` LIKE  ".cf_quotevalue($app['always']['facebook']['user_id'])."
      AND `fb_access_token` LIKE  ".cf_quotevalue($app['always']['facebook']['access_token'])."
      AND `fb_expiration_date` > NOW()
    LIMIT 0, 2";

  $result = $mysqli->query($query);

  if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    $ss_user_id = $row['ss_user_id'];
  }
  else {
    $return['message'] = 'You have to login with Facebook to gain access to Snailsnapp';
    die(json_encode($return));
  }
}

?>