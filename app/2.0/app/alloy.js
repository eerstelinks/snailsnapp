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

// create just a random string
function randomString(string_length) {
  var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
  var randomstring = '';
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}

// bindPlaceholder let you create a beautiful placeholder
// and make your text gray when not active
function bindPlaceholder(textareaObject, placeholderText) {

  var originalColor = textareaObject.getColor();

  // set placeholder when value is empty
  if (textareaObject.getValue() == '') {
    textareaObject.setValue(placeholderText);
    textareaObject.setColor(Alloy.CFG.grey);
  }
  else if (textareaObject.getValue() == placeholderText) {
    textareaObject.setColor(Alloy.CFG.grey);
  }

  // set original color when text changes from script (not user)
  textareaObject.addEventListener('change', function(e) {
    textareaObject.setColor(originalColor);
  });

  // delete placeholder when user focus (taps) the textarea
  textareaObject.addEventListener('focus', function(e) {
    if (e.source.value == placeholderText) {
        e.source.value = '';
    }
    textareaObject.setColor(originalColor);
  });

  // add placeholder when user blurs the textarea
  textareaObject.addEventListener('blur', function(e) {
    if (e.source.value == '') {
        e.source.value = placeholderText;
        textareaObject.setColor(Alloy.CFG.grey);
    }
    else {
      textareaObject.setColor(originalColor);
    }
  });
}