// Alloy required for Facebook
var facebook = Alloy.Globals.Facebook;
facebook.appid = "1417460311823818"; // Facebook App ID
facebook.permissions = ["email", "user_birthday", "user_location", "publish_actions"]; // Facebook App Permissions

// Hide fbButton after login
facebook.addEventListener('login', function(e) {
    if (e.success) {
		Alloy.createController('map').getView().open();
    }
    else {
    	showErrorAlert();
    }
});

$.fbButton.style = facebook.BUTTON_STYLE_WIDE; // Shows 'Connect to Facebook' instead of 'Connect'

$.index.open();
