function closeSettings() {
  $.settings.close();
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