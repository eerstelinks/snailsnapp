// require modules only where needed2
var ImageFactory = require('ti.imagefactory');

// include amazon upload script
Ti.include('/js/upload.js');

// always destroy login when closed
$.postphoto.addEventListener('close', function() {
  $.destroy();
});

// set upload sizes (from large to small)
var uploadSizes  = [1536, 640, 200, 80];
var uploadedUrls = {};
var xhrRequests  = {};
var areAllUploadsFinished = false;
var isUserFinished        = false;
var cancelledAllUploads   = false;

// get arguments from the previous controller
var args    = arguments[0] || {};
var mapView = args.mapView;

// set textarea width depending on device with so the previewImage won't overflow the textarea
$.description.width = Ti.Platform.displayCaps.platformWidth * 0.9 - 100 - 5;

// bind placeholder function to description field so it works on iphone
bindPlaceholder($.description, L('post_photo_description_placeholder'));

function setLoadingBars(booleanOrProcent) {
  if (booleanOrProcent === false) {
    mapView.loadingBar.setVisible(false);
    $.loadingBar.setVisible(false);
  }
  else if (booleanOrProcent === true) {
    mapView.loadingBar.setVisible(true);
    $.loadingBar.setVisible(true);
  }
  else {
    mapView.loadingBar.setWidth(booleanOrProcent + '%');
    $.loadingBar.setWidth(booleanOrProcent + '%');
  }
}

function getLoadingBars() {
  return $.loadingBar.getWidth();
}

function setUploadActive(isActive) {
  if (isActive) {
    mapView.activeUploadIcon.setVisible(true);
    Ti.App.Properties.setBool('is_upload_active', true);
  }
  else {
    mapView.activeUploadIcon.setVisible(false);
    Ti.App.Properties.setBool('is_upload_active', false);
  }
}

// function always after download
function always() {

  // hide loading bars
  setLoadingBars(false);
}

Ti.include('/js/camera_overlay.js');
var cameraOverlay = createCameraOverlay(
  function() {
    setUploadActive(false);
    Ti.Media.hideCamera();
    $.postphoto.close();
  }
);

function updateProgress(totalProgress) {

  var total = 0;
  for (key in totalProgress) {
    total += totalProgress[key];
  }

  // set max uploadprogress to 70%
  total = total * 0.7;

  setLoadingBars(total);
}

// only called when all uploads are done
function allUploadsAreFinished() {

  // delete local file for uploading again which isn't necessary anymore after success
  Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'lastimage').deleteFile();

  areAllUploadsFinished = true;
  checkIfBothAreFinished();
}

function setEditableTo(editable) {
  if (editable) {
    $.postPhotoSrollView.setTouchEnabled(true);
    $.postPhotoSrollView.setOpacity(1);
    $.submitButton.setTitle(L('post_photo_button'));
  }
  else {
    // disable user input
    $.postPhotoSrollView.setTouchEnabled(false);
    $.postPhotoSrollView.setOpacity(0.5);
    $.submitButton.setTitle(L('post_photo_button_edit'));
  }
}

// has user hit post button jet?
function userSubmits() {

  if (!mayUserSend()) {
    setUploadActive(true);
    setEditableTo(true);
  }
  // check if user is clicking on posting or edit
  else if (this.title == L('post_photo_button')) {

    setEditableTo(false);

    // view progressbar
    setLoadingBars(true);

    // hide and keep running in background
    $.postphoto.hide();

    // try to upload again when uploads are cancelled
    if (cancelledAllUploads === true) {

      // start upload again and use blob from local files
      startUpload(false);
    }

    isUserFinished = true;
    checkIfBothAreFinished();
  }
  else if (this.title == L('post_photo_button_edit')) {

    isUserFinished = false;
    setEditableTo(true);
    setLoadingBars(false);
  }
}

// this function checks if userIsFinished && allUploadsAreFinished
function checkIfBothAreFinished() {

  if (areAllUploadsFinished && isUserFinished) {
    postSnappToSnailsnapp();
  }
}

// this is called for every upload fail (uploadSizes.length)
function cancelAllUploads(e) {

  // excute this script part once
  if (cancelledAllUploads === false) {

    // let user control input
    setEditableTo(true);

    // abort all xhrRequests
    for (key in xhrRequests) {
      xhrRequests[key].abort();
    }

    // upload function returns object when fails
    // show no message when just the function is called
    if (typeof e == 'object') {

      setLoadingBars(false);

      // ask user to upload again
      dialogs.confirm({
        title: L('default_error_title'),
        message: L('confirm_upload_again'),
        no: L('button_no'),
        yes: L('button_yes'),
        callback: function() {

          // start upload again and use blob from local files
          startUpload(false);
          $.postphoto.show();
        }
      });

    }
    else {
      setLoadingBars(false);
      setUploadActive(false);
    }

    cancelledAllUploads = true;
  }
}

// start upload when fired
function startUpload(largeBlob) {

  // reset variables and progressbar
  uploadedUrls = {};
  areAllUploadsFinished = false;
  isUserFinished = false;
  cancelledAllUploads = false;
  setLoadingBars(0);
  setUploadActive(true);

  // largeBlob is set to false when user is trying to upload the same file again (probably after an error)
  if (largeBlob === false) {
    var localBlob = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'lastimage');
    if (localBlob.exists()) {
      largeBlob = localBlob.read();
    }
    else {
      showErrorAlert(L('upload_again_failed'));
      $.postphoto.close();
    }
  }

  // set object to convert extensions to common used extensions
  var convertExtension = { 'jpeg': 'jpg', 'pjpeg': 'jpg' };

  // select usefull extension, convert jpeg to jpg etc.
  var mimeType  = largeBlob.getMimeType();
  var extension = mimeType.split('/')[1];
  extension     = convertExtension[extension] || extension;

  var totalProgress = {};

  // create an unique name
  var currentSeconds = Math.floor(new Date().getTime() / 1000);

  // save blob to local folder so when upload fails the user can try again
  Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'lastimage').write(largeBlob);

  var resizeBlob = largeBlob;
  var sumSizes   = uploadSizes.reduce(function(a, b) { return a + b });

  // upload to amazon
  uploadSizes.forEach(function(size) {

    if (resizeBlob.width != size) {
      resizeBlob = ImageFactory.imageAsResized(resizeBlob, { width: size, height: size, quality: ImageFactory.QUALITY_NONE } );
    }

    var name = 'users/adriaan/' + size + '/' + currentSeconds + '_' + randomString(6) + '.' + extension;

    // create funtion for every success
    var successFunction = function(e) {

      uploadedUrls[size] = e.url;

      if (Object.size(uploadedUrls) == uploadSizes.length) {
        allUploadsAreFinished();
      }
    }

    xhrRequests[size] = uploadToS3(name, resizeBlob, successFunction, cancelAllUploads, function(progress) {
      relativeProgress = progress / 100 * size * 100 / sumSizes;
      totalProgress[size] = relativeProgress;
      updateProgress(totalProgress);
    });

  });
}

// in a function so we can change the picture also with this function
function makePicture() {

  Ti.Media.showCamera({
    success:function(e) {

      // largest image size
      var largeImageSize = uploadSizes[0];

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
      blob = ImageFactory.imageAsCropped(blob, { width: crop, height: crop } );
      blob = ImageFactory.imageAsResized(blob, { width: largeImageSize, height: largeImageSize, quality: ImageFactory.QUALITY_NONE } );
      blob = ImageFactory.compress(blob, 0.50);

      // create preview blob
      var previewBlob = blob;
      previewBlob     = ImageFactory.imageAsResized(previewBlob, { width: 200, height: 200, quality: ImageFactory.QUALITY_NONE } );
      $.previewImage.image = previewBlob;

      if (Titanium.Network.online) {
        startUpload(blob);
      }
    },
    cancel:function(e) {
      $.postphoto.close();
    },
    error:function(e) {
      showErrorAlert(L('other_camera_error_message'));
      $.postphoto.close();
    },
    allowEditing: false,
    //saveToPhotoGallery: true,
    autohide: true,
    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
    overlay: cameraOverlay,
    showControls: false,
  });
}

makePicture();

function togglePostAnonymous() {

  var postPublic = $.postPublic.value;

  // hiddenView is the View around the switch
  if (postPublic === true) {
    $.hiddenView.show();
  }
  else {
    $.hiddenView.hide();
  }
}

// what to do with the backbutton
function backButton() {
  setUploadActive(true);
  $.postphoto.hide();
}

// what to do with the cancelbutton
function cancelButton() {

  dialogs.confirm({
    title: L('confirm_delete_snapp_title'),
    message: L('confirm_delete_snapp_message'),
    no: L('button_no'),
    yes: L('button_yes'),
    callback: function() {

      cancelAllUploads();
      $.postphoto.close();
    }
  });
}

var isFacebookPostFinished   = false;
var isSnailsnappPostFinished = false;

function checkIfFbAndSsAreFinished() {
  if (isFacebookPostFinished && isSnailsnappPostFinished) {

    // close window and shizzle is done...
    setLoadingBars(false);
    setUploadActive(false);
    $.postphoto.close();
  }
}

function postSnappToSnailsnapp() {

  // set text to uploading to facebook, no edit anymore
  $.submitButton.setTitle(L('post_photo_button_posting'));

  // if share-on-facebook is checked go here
  if ($.postFacebook.value === true) {
    postToFacebook();
  }
  else {
    setLoadingBars(getLoadingBars() + 15);
    isFacebookPostFinished = true;
  }

  postToSnailsnapp();

}

function postToSnailsnapp() {

  Ti.Geolocation.getCurrentPosition(function(currentLocation) {

    if (!currentLocation) {
      showErrorAlert(L('geo_no_location_message'), L('geo_no_location_button'));
      return false;
    }

    setLoadingBars(getLoadingBars() + 5);

    sendObject = {
      uploaded_urls:      uploadedUrls,
      description:        $.description.value,
      shared_facebook:    $.postFacebook.value,
      shared_snailsnapp:  $.postPublic.value,
      shared_anonymous:   $.postAnonymous.value,
      created:            new Date(),
      geolocation:        currentLocation.coords
    }

    // upload data to snailsnapp
    uploadToSnailsnapp(
      '/post/snapp/create',
      function(json) {
        //success
        setLoadingBars(getLoadingBars() + 10);
        isSnailsnappPostFinished = true;
        checkIfFbAndSsAreFinished();
      },
      function() {
        //error
        showErrorAlert();
        setEditableTo(true);
        $.postphoto.show();
      },
      sendObject
    );
  });
}

function postToFacebook() {

  // set text to uploading to facebook, no edit anymore
  $.submitButton.setTitle(L('post_photo_button_facebook'));
  setLoadingBars(getLoadingBars() + 5);

  // check for posting permissions
  facebook.requestWithGraphPath('me/permissions', {}, 'GET', function(response) {

    var hasPostPermission = false;

    // try and ignore errors
    try {
        var permissions = JSON.parse(response.result);
        if (permissions.data[0].publish_actions == 1) {
          hasPostPermission = true;
        }
    } catch(e) {}

    // permission to post, go ahead
    if (hasPostPermission) {

      var snappDescription = $.description.value;
      var snappUrl = uploadedUrls[uploadSizes[0]];
      var snappData = {
        message: snappDescription,
        url: snappUrl
      }
      facebook.requestWithGraphPath('me/photos', snappData, 'POST', function(e) {

        if (e.success) {
          setLoadingBars(getLoadingBars() + 10);
        }
        else {
          showErrorAlert(L('post_photo_facebook_error'));
        }

        isFacebookPostFinished = true;
        checkIfFbAndSsAreFinished();

      });
    }
    else {
      // no permission to post, ask for re-log in
      dialogs.confirm({
        title: L('post_photo_no_permission_title'),
        message: L('post_photo_no_permission_message'),
        no: L('button_no'),
        yes: L('button_yes'),
        callback: function() {

          Alloy.Globals.Facebook.reauthorize(['publish_actions', 'photo_upload'], 'friends', function(e) {
            if (e.success){
              postToFacebook();
            }
            else {
              $.postFacebook.setValue(false);
              showErrorAlert();
              isFacebookPostFinished = true;
              checkIfFbAndSsAreFinished();
            }
          });

        }
      });
    }
  });
}

// explanation alerts
function explainFacebook() {
  showSuccessAlert(L('explain_facebook_message'), null, L('explain_facebook_title'));
}
function explainSnailsnapp() {
  showSuccessAlert(L('explain_snailsnapp_message'), null, L('explain_snailsnapp_title'));
}
function explainAnonymous() {
  showSuccessAlert(L('explain_anonymous_message'), null, L('explain_anonymous_title'));
}
