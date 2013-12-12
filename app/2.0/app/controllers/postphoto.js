// require modules only where needed2
var ImageFactory = require('ti.imagefactory');

// get arguments from the previous controller
var args = arguments[0] || {};

// set object to convert extensions to common used extensions
var convertExtension = { 'jpeg': 'jpg', 'pjpeg': 'jpg' };

// set textarea width depending on device with so the previewImage won't overflow the textarea
$.description.width = Ti.Platform.displayCaps.platformWidth * 0.9 - 100 - 5;

// bind placeholder function to description field so it works on iphone
bindPlaceholder($.description, L('post_photo_description_placeholder'));

// in a function so we can change the picture also with this function
function makePicture() {

  Ti.Media.showCamera({
    success:function(e) {

      // touchEnabled
      var buttonOrignalTitle = $.submitButton.getTitle();
      $.submitButton.setTitle(buttonOrignalTitle + ' (' + L('wait_for_upload', 'wait for upload') + ')');

      // crop size
      var squareSize = 2048;
      //var squareSize = 640;

      // fetch image
      var blob = e.media;

      // convert first toImage so the correct orientation will be kept
      // works on iPhone, maybe not on Android
      blob = Titanium.UI.createImageView({ image: blob }).toImage();

      // calculate crop dimensions for a square
      if (blob.width >= blob.height) {
         var crop = blob.height;
      } else {
         var crop = blob.width;
      }

      // crop image, resize it and compress it like a motherf*cker (to ~800Kb)
      blob = ImageFactory.imageAsCropped(blob, { width: crop, height: crop, x: 0, y: 0 } );
      blob = ImageFactory.imageAsResized(blob, { width: squareSize, height: squareSize, quality: ImageFactory.QUALITY_NONE } );
      blob = ImageFactory.compress(blob, 0.50);

      // create preview blob
      var previewBlob = blob;
      previewBlob     = ImageFactory.imageAsResized(previewBlob, { width: 200, height: 200, quality: ImageFactory.QUALITY_NONE } );
      $.previewImage.image = previewBlob;

      // select usefull extension, convert jpeg to jpg etc.
      var mimeType  = blob.getMimeType();
      var extension = mimeType.split('/')[1];
      extension     = convertExtension[extension] || extension;

      // create an unique name
      var currentSeconds = Math.floor(new Date().getTime() / 1000);
      var name = 'users/1234567890/' + squareSize + '/' + currentSeconds + '_' + randomString(6) + '.' + extension;

      // upload only when we hit 'Yes'
      dialogs.confirm({
        message: 'Would you like to upload it to Amazon? (only for developers)',
        callback: function() {

          // include amazon upload script
          Ti.include('/js/upload.js');

          // upload to amazon
          uploadToS3(
            name,
            blob,
            function(e) {
              alert('upload success: ' + e.url);
              $.submitButton.setTitle(buttonOrignalTitle);
              $.submitButton.setTouchEnabled(true);
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
