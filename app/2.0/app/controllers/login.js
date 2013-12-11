// Hide fbButton after login
$.fbLoader.hide();

facebook.addEventListener('login', function(e) {
  if (e.success) {

    // show indicator of loading
    $.fbButton.hide();
    $.fbLoader.show();

    Alloy.createController('index').getView().open();
    $.login.close();
  }
  else {
    showErrorAlert();
  }
});

//skip login if asked to do so, then hide the button
function goHome() {
  Ti.App.Properties.setBool('has_skipped_login' , true);
  $.skipLogin.hide();
  $.login.close();
}
