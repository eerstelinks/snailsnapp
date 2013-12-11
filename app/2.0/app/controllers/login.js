// Hide fbButton after login
facebook.addEventListener('login', function(e) {
  if (e.success) {
    Alloy.createController('index').getView().open();
    $.login.close();
  }
  else {
    showErrorAlert();
  }
});