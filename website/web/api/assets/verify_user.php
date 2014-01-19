<?php

if (!isset($verifyUser)) {
  $verifyUser = false;
}

if (!isset($app)) {
  $return['debug'] = 'No post data';
  die(json_encode($return));
}

$fb_logged_in = false;
if (isset($app['always']['facebook']['is_logged_in']) && $app['always']['facebook']['is_logged_in'] === true) {
  $fb_logged_in = true;
}

if ((isset($loginNotRequired) && $loginNotRequired === true) && !$fb_logged_in) {
  $verifyUser = false;

  if (!isset($ss_user_id)) {
    $ss_user_id = 0;
  }
}

if ($verifyUser) {
  // required items
  if (!isset($app['always']['facebook']['is_logged_in'])) {
    $error[] = 'always.facebook.is_logged_in not received';
  }
  if (!isset($app['always']['facebook']['user_id'])) {
    $error[] = 'always.facebook.user_id not received';
  }
  if (!isset($app['always']['facebook']['access_token'])) {
    $error[] = 'always.facebook.access_token not received';
  }
  if (!isset($app['always']['facebook']['expiration_date'])) {
    $error[] = 'always.facebook.expiration_date not received';
  }

  if (!empty($error)) {
    $return['debug'] = implode(', ', $error);
    die(json_encode($return));
  }

  // check for if facebook user is valid
  // if the access token is not valid, check the access token the user send us
  // if that is valid, update our database with the new access token

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

    $query = "SELECT `ss_user_id`
      FROM  `users`
      WHERE `fb_user_id` LIKE  ".cf_quotevalue($app['always']['facebook']['user_id'])."
      LIMIT 0, 2";

    $result = $mysqli->query($query);

    if ($result->num_rows == 1) {

      $row = $result->fetch_assoc();

      // update only when access token is correct
      // check on facebook
      $checkTokenUrl = 'https://graph.facebook.com/me?access_token='.$app['always']['facebook']['access_token'];
      $contentToken  = file_get_contents($checkTokenUrl);

      if ($contentToken) {

        $tokenArray = json_decode($contentToken, true);

        if (isset($tokenArray['id']) && $tokenArray['id'] == $app['always']['facebook']['user_id']) {

          $insert['fb_user_id']         = $app['always']['facebook']['user_id'];
          $insert['fb_access_token']    = $app['always']['facebook']['access_token'];
          $insert['fb_expiration_date'] = $app['always']['facebook']['expiration_date'];

          $query = "UPDATE `users` SET ".cf_implode_mysqli($insert).", `last_modified` = NOW() WHERE `ss_user_id` = ".cf_quotevalue($row['ss_user_id']);

          if ($mysqli->query($query)) {
            $ss_user_id = $row['ss_user_id'];
          }

          unset($insert);
        }
      }
    }

    if (!isset($ss_user_id)) {
      $return['message'] = L('login_to_facebook');
      die(json_encode($return));
    }
  }
}

?>