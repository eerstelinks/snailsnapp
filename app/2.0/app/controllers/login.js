// is the map already loaded?
var showedMap = Ti.App.Properties.getBool('showed_map', false);

// show skip button when user has not skipped before
if (!Ti.App.Properties.getBool('has_skipped_login', true)) {
  $.skipLogin.show();
}
else {
  $.skipLogin.text = $.skipLogin.getText() + ' (only for dev)';
  $.skipLogin.show();
}

facebook.addEventListener('login', function(e) {
  if (e.success) {

    // hide logout button
    $.fbButton.hide();

    // hide skip, because you will get there sowieso
    $.skipLogin.hide();

    // show indicator of loading
    $.fbLoader.show();

    if (!showedMap && Ti.App.Properties.getBool('send_back_to_post_photo', false) === false) {
      Alloy.createController('index').getView().open();
    }

    // set timeout so the indicater will show
    setTimeout(function(){
      $.login.close();
    }, 1500);

  }
  else {
    showErrorAlert(e.error);
  }
});

//skip login if asked to do so
function goHome() {
  Ti.App.Properties.setBool('has_skipped_login', true);

  if (!showedMap) {
    Alloy.createController('index').getView().open();
  }

  $.login.close();
}
