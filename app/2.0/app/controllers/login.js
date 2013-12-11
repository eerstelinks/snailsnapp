//hide fbButton after login
facebook.addEventListener('login', function(e) {
  if (e.success) {
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
  Alloy.createController('index').getView().open();
  $.login.close();
}
