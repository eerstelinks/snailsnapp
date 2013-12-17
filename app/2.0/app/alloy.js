// Colors
Alloy.CFG.green = "#18DB6E";
Alloy.CFG.grey  = "#DCDCDC";
Alloy.CFG.white = "#FFFFFF";
Alloy.CFG.black = "#000000";

// settings
var api_url = "https://eerstelinks.nl/snailsnapp/api";

// set device hash
if (!Ti.App.Properties.hasProperty('device_hash')) {
  Ti.App.Properties.setString('device_hash', randomString(20));
}

// check for updates
if (!Ti.App.Properties.hasProperty('previous_version')) {
  Ti.App.Properties.setString('previous_version', Ti.App.version);
}
else if (Ti.App.Properties.getString('previous_version') != Ti.App.version) {
  // do some updating because the app version has changed
}

// require map module
Alloy.Globals.Map = require('ti.map');
Alloy.Globals.Facebook = require('facebook');

// require dialogs builtin
var dialogs = require('alloy/dialogs');

// facebook var with Titanium module
var facebook = Alloy.Globals.Facebook;
facebook.appid = "1417460311823818"; // Facebook App ID
facebook.permissions = ["email", "user_birthday", "user_location", "publish_actions", "photo_upload"]; // Facebook App Permissions

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

// function .size() for counting elements in an object
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {

  if (!Ti.App.Properties.getBool('asked_for_push_notifications', false) && !Ti.Network.getRemoteNotificationsEnabled()) {

    // ask only one time
    Ti.App.Properties.setBool('asked_for_push_notifications', true);

    // ask user to upload again
    dialogs.confirm({
      title: L('push_reason_title'),
      message: L('push_reason_message'),
      no: L('push_reason_button_no'),
      yes: L('push_reason_button_yes'),
      callback: function() {

        require('push_notifications');

      }
    });
  }
  else {
    require('push_notifications');
  }

}

// check if user is logged in to Facebook
function mayUserSend() {
  if (!Ti.Network.online) {
    showErrorAlert(L('not_online_message'), L('not_online_button'));
    return false;
  }
  else if (!facebook.loggedIn) {
    showErrorAlert(L("default_not_logged_in_message"), L("default_not_logged_in_button"));
    // go to login screen when user is not logged in
    Alloy.createController('login').getView().open();

    return false;
  }

  return true;
}

// enable background service
var service;

Ti.App.addEventListener('resumed',function(e){
  if (service!=null){
    service.stop();
    service.unregister();
  }
});

Ti.App.addEventListener('pause',function(e){
  service = Ti.App.iOS.registerBackgroundService({url:'bg.js'});
});