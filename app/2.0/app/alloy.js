// Colors
Alloy.CFG.green = "#18DB6E";
Alloy.CFG.grey  = "#DCDCDC";
Alloy.CFG.white = "#FFFFFF";
Alloy.CFG.black = "#000000";

// settings
var app_version = '2.0';
var api_url = "https://eerstelinks.nl/snailsnapp/api";

// require map module
Alloy.Globals.Map = require('ti.map');
Alloy.Globals.Facebook = require('facebook');

// require dialogs builtin
var dialogs = require('alloy/dialogs');

// facebook var with Titanium module
var facebook = Alloy.Globals.Facebook;
facebook.appid = "1417460311823818"; // Facebook App ID
facebook.permissions = ["email", "user_birthday", "user_location", "publish_actions"]; // Facebook App Permissions

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
