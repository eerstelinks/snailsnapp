// require modules only where needed2
var ImageFactory = require('ti.imagefactory');

// include amazon upload script
Ti.include('/js/upload.js');

// set upload sizes (from large to small)
var uploadSizes  = [1536, 640, 200, 20];
var uploadedUrls = {};
var areAllUploadsFinished = false;
var isUserFinished = false;

// get arguments from the previous controller
var args = arguments[0] || {};
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

// function always after download
function always() {

  // hide loading bars
  setLoadingBars(false);
}

Ti.include('/js/camera_overlay.js');
var cameraOverlay = createCameraOverlay(
  function() {
    Ti.Media.hideCamera();
    $.postphoto.close();
  }
);

function updateProgress(totalProgress) {

  var total = 0;
  for (key in totalProgress) {
    total += totalProgress[key];
  }

  // set max uploadprogress to 90%
  total = total / 4 * 0.9;

  setLoadingBars(total);
}

// only called when all uploads are done
function allUploadsAreFinished() {

  areAllUploadsFinished = true;
  checkIfBothAreFinished();
}

// has user hit post button jet?
function userIsFinished() {

  // view progressbar
  setLoadingBars(true);

  // hide and keep running in background
  $.postphoto.hide();

  isUserFinished = true;
  checkIfBothAreFinished();
}

// this function checks if userIsFinished && allUploadsAreFinished
function checkIfBothAreFinished() {

  if (areAllUploadsFinished && isUserFinished) {
    // post to snailsnapp.com
    //$.postphoto.show();
    postSnappToSnailsnapp();
  }
}

// start upload when fired
function startUpload(largeBlob) {

  // reset variables and progressbar
  uploadedUrls = {};
  areAllUploadsFinished = false;
  isUserFinished = false;
  setLoadingBars(5);

  // set object to convert extensions to common used extensions
  var convertExtension = { 'jpeg': 'jpg', 'pjpeg': 'jpg' };

  // select usefull extension, convert jpeg to jpg etc.
  var mimeType  = largeBlob.getMimeType();
  var extension = mimeType.split('/')[1];
  extension     = convertExtension[extension] || extension;

  var totalProgress = {};

  // create an unique name
  var currentSeconds = Math.floor(new Date().getTime() / 1000);

  var resizeBlob = largeBlob;

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

    uploadToS3(name, resizeBlob, successFunction, function() { alert('upload failed') }, function(progress) { totalProgress[size] = progress; updateProgress(totalProgress) });

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

      startUpload(blob);
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

function cancelSnapp() {
  $.postphoto.hide();
}

function postSnappToSnailsnapp() {
  // check if user is logged in to Facebook
  if (!facebook.loggedIn) {
    showErrorAlert('L("default_not_logged_in_message")','L("default_not_logged_in_button")');
    Ti.App.Properties.setBool('send_back_to_post_photo', true);
    // go to login screen when user is not logged in
    Alloy.createController('login').getView().open();
    // postphotowindow is not closed because the user returns after logging in
  }
  // if share-on-facebook is checked go here
  else if ($.postFacebook.value === true) {
    // check for posting permissions
    facebook.requestWithGraphPath('me/permissions', {}, 'GET', function(p) {
      var permissions = JSON.parse(p.result);
      // permission to post, go ahead
      if (permissions.data[0].publish_actions == 1) {

        var snappDescription = $.description.value;
        var snappUrl = uploadedUrls[uploadSizes[0]];
        var snappData = {
          message: snappDescription,
          url: snappUrl
        }
        facebook.requestWithGraphPath('me/photos', snappData, 'POST', function(e) {
          if (e.success) {
            alert("Posted to Facebook!");
            setLoadingBars(false);
            $.postphoto.close();
          }
          else {
            alert();
          }
        });
      }
      else {
        // no permission to post, ask for re-log in
        dialogs.confirm({
          title: L("post_photo_no_permission_title"),
          message: L("post_photo_no_permission_message"),
          yes: L("button_yes"),
          no: L("button_no"),
          callback: function() {
            Alloy.Globals.Facebook.reauthorize(["publish_actions", "photo_upload"], 'friends', function(e) {
              if (e.success){
                postSnappToSnailsnapp();
              }
              else {
                showErrorAlert();
              }
            });
          }
        });
      }
    });
  }
  else {
    setLoadingBars(false);
    $.postphoto.close();
  }
}
