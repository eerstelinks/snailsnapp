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