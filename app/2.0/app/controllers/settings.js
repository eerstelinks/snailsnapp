function closeSettings() {
  $.settings.close();
}

// get this user's notification preferences
uploadToSnailsnapp(
  '/get/user/notification_settings',
  function(json) {
    if (json.has_result) {
      for (key in json.notification_settings) {
        updateSwitches(key, json.notification_settings[key]);
      }
    }
    else {

    }
  },
  function(alert) {
    showErrorAlert(alert);
  },
  {
  }
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
  uploadToSnailsnapp(
    '/post/user/notification_settings',
    function() {
      showSuccessAlert();
    },
    function(e) {
      showErrorAlert(e);
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