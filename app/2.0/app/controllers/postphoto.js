var ImageFactory = require('ti.imagefactory');

var args = arguments[0] || {};

// show camera only when past controller has said so
if (args.showCamera === true) {

  Ti.Media.showCamera({
    success:function(e) {
      showSuccessAlert('camera success');
    },
    cancel:function(e) {
      $.postphoto.close();
    },
    error:function(e) {
      showErrorAlert(L('other_camera_error_message'));
      $.postphoto.close();
    },
    allowEditing: false,
    saveToPhotoGallery: true,
    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
  });
}

function outputStateFacebook() {
  Ti.API.info('Switch value: ' + $.postFacebook.value);
}
function outputStatePublic() {
  Ti.API.info('Switch value: ' + $.postPublic.value);

  //toggle post anonymous
  var postPublic = $.postPublic.value;
  if (postPublic === true) {
    $.hiddenView.show();
  }
  else {
    $.hiddenView.hide();
  }
}
function outputStateAnonymous() {
  Ti.API.info('Switch value: ' + $.postAnonymous.value);
}
function cancelSnapp() {
  $.navWin.close();
}
