<?php
require(dirname(__FILE__).'/../../assets/init.php');
require(dirname(__FILE__).'/../../assets/json_header.php');

// get data from the app
if (count($_POST) > 0) {
  $appData = json_decode(stripslashes($_POST['data']), true);
}
else {
  // fill in test data
  $appData = array();
  $appData['always']['fb_user_id'] = '';
  $appData['always']['fb_access_token'] = '';
  $appData['always']['fb_expiration_date'] = '';
}

// do something with the data

  // check data from the app
  if (empty($appData['always'])) {
    // error
  }
  else {
    // check for fb_user_id, access token, ...

      // if ok, check database for exsisting user
      $query = "SELECT * FROM `users`";
      $result = $mysqli->query($query);

        while($row = $result->fetch_assoc()) {
          // loop though every row
        }

        // if ok, update user data

        // if not, inset user data
  }

    // throw error back to app when failed

  // store data from database

  // recieve data from database

// return data back to the app
$return['status'] = 'success';
echo json_encode($return);
?>