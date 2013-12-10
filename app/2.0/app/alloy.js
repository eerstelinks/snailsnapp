// Colors
Alloy.CFG.green = "#18DB6E";
Alloy.CFG.grey  = "#DCDCDC";
Alloy.CFG.white = "#FFFFFF";

// settings
var app_version = '2.0';
var api_url = "https://eerstelinks.nl/snailsnapp/api";

// require map module
Alloy.Globals.Map = require('ti.map');
Alloy.Globals.Facebook = require('facebook');


// common functions

// simple error alert box with optional messsages
function showErrorAlert(message, button, title) {
	dialog = Ti.UI.createAlertDialog({
    	message: message || L('default_error_message'),
    	ok: button || L('default_error_button'),
    	title: title || L('default_error_title')
	}).show();
}

// simple success alert box with optional messsages
function showSuccessAlert(message, button, title) {
	dialog = Ti.UI.createAlertDialog({
    	message: message || L('default_success_message'),
    	ok: button || L('default_success_button'),
    	title: title || L('default_success_title')
	}).show();
}
