// always destroy window when closed
$.settings.addEventListener('close', function() {
  $.destroy();
});

facebook.addEventListener('logout', function(e) {
  Alloy.createController('login').getView().open();
  closeSettings();
});

function closeSettings() {
  $.settings.close();
}

function showBusy(boolean) {
  if (boolean === true) {
    $.loader.show();
  }
  else if (boolean === false) {
    $.loader.hide();
  }
}

showBusy(true);

// get this user's notification preferences
uploadToSnailsnapp(
  '/get/user/notification_settings',
  function(json) {
    if (json.has_result) {
      for (key in json.notification_settings) {
        updateSwitches(key, json.notification_settings[key]);
      }
    }
    showBusy(false);
  },
  function() {
    showBusy(false);
  },
  {}
);

function updateSwitches(notificationName, value) {
  $[notificationName].setValue(value);
}

function toggleSwitch(event) {
  var toggle         = event.source;
  var toggleId       = toggle.id;
  var toggleValue    = toggle.value;

  if (toggleId == 'never' && toggleValue === true) {
    $.loves_my_snapp.setValue(false);
    $.loves_my_comment.setValue(false);
    $.comments_my_snapp.setValue(false);
    $.comments_my_comment.setValue(false);
    $.loves_comment_my_snapp.setValue(false);
    $.loves_comment_my_comment.setValue(false);
    $.snailsnapp_updates.setValue(false);
    $.special_occasions.setValue(false);
  }
  else if ($.never.value === true && toggleValue === true) {
    $.never.setValue(false);
  }
}

function sendSettingsToSnailSnapp() {

  if (mayUserSend()) {
    showBusy(true);

    uploadToSnailsnapp(
      '/post/user/notification_settings',
      function() {
        showBusy(false);
      },
      function(e) {
        showErrorAlert(e);
        showBusy(false);
      },
      {
        never: $.never.value,
        loves_my_snapp: $.loves_my_snapp.value,
        loves_my_comment: $.loves_my_comment.value,
        comments_my_snapp: $.comments_my_snapp.value,
        comments_my_comment: $.comments_my_comment.value,
        loves_comment_my_snapp: $.loves_comment_my_snapp.value,
        loves_comment_my_comment: $.loves_comment_my_comment.value,
        snailsnapp_updates: $.snailsnapp_updates.value,
        special_occasions: $.special_occasions.value
      }
    );
  }
}