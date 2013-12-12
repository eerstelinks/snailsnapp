// require modules only where needed2
var ImageFactory = require('ti.imagefactory');

var args = arguments[0] || {};

// show camera only when past controller has said so
if (args.showCamera === true) {

  Ti.Media.showCamera({
    success:function(e) {

      // fetch image
      var blob = e.media;

      // upload only when we hit Yes
      dialogs.confirm({
        message: 'Would you like to upload it to Amazon? (only for developers)',
        callback: function() {

          // calculate crop dimensions for a square
          if (blob.width >= blob.height) {
             var crop = blob.height;
          } else {
             var crop = blob.width;
          }

          // crop image, resize it and compress it like a motherf*cker (to ~800Kb)
          blob = ImageFactory.imageAsCropped(blob, { width: crop, height: crop, x: 0, y: 0 } );
          blob = ImageFactory.imageAsResized(blob, { width: 2048, height: 2048, quality: ImageFactory.QUALITY_NONE } );
          blob = ImageFactory.compress(blob, 0.50);

          // include amazon upload script
          Ti.include('/js/upload.js');

          // upload to amazon
          uploadToS3(
            'device_test_01.png',
            blob,
            function(e) {
              alert('upload success: ' + e.url);
            },
            function() {
              alert('failed');
            },
            function(progress) {
              $.description.setValue(progress);
            }
          );
        }
      });

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
