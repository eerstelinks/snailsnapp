// default upload function
Ti.include('/js/upload.js');

function checkUserData() {

  // check last time you checked


  // update when old with updateUserData()
  //updateUserData();

}

function updateUserData() {

  uploadToSnailsnapp(
    '/post/user/update',
    // succesCallback
    function(response) {

      alert(JSON.stringify(response));

      if (response.status == 'success') {
        // set new time checked to now
      }
      else {
        // log error (later)
      }
    },
    function(e) {
      alert(JSON.stringify(e));
      // log error (later)
    },
    {} // empty object (function will auto fill in the user data in variable always)
  );

}