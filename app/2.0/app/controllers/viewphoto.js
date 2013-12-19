// always destroy login when closed
$.viewphoto.addEventListener('close', function() {
  $.destroy();
});

// include snailsnapp upload script
Ti.include('/js/upload.js');

var args = arguments[0] || {};

if (args.snapp) {
  var snapp = args.snapp;
}
else {
  showErrorAlert('no snap found!');
  $.viewphoto.close();
}

// bind placeholder function to description field so it works on iphone
bindPlaceholder($.new_comment, L('view_photo_comment_placeholder'));

// get the comments that belong to this snapp
uploadToSnailsnapp(
  '/get/snapp/comment',
  function(json) {
    if (json.result_count > 0) {
      for (key in json.comments) {
        var commentData = json.comments[key];
        addNewComment(commentData);
      }
    }
  },
  function(alert) {
    showErrorAlert(alert);
  },
  {
    snapp_id: snapp.snapp_id,
  }
);

// show indicator for loading image
showIndicator();
function showIndicator() {
  var screenWidth = Ti.Platform.displayCaps.platformWidth;
  $.activityIndicator.show();
  $.activityIndicator.setWidth('100%');
  $.activityIndicator.setHeight(screenWidth);
  $.activityIndicator.setStyle('BIG');
}
$.snapp_image.setImage(snapp.url_phone);
$.snapp_description.setText(snapp.description);

// Add event listener to snapp love button
$.image_love.addEventListener('click',function(event) {
  giveLove(event, 'snapp');
});

if (snapp.shared_anonymous == 0) {
  $.fb_profile_pic.setImage('http://graph.facebook.com/' + snapp.fb_user_id + '/picture?width=120&height=120');
  $.fb_full_name.setText(snapp.fb_full_name);
}
else {
  $.fb_profile_pic.setImage('/images/henkie.png');
  $.fb_full_name.setText(L('henkie_name'));
}

var date = showLocalDateTime(snapp.created);
$.snapp_created.setText(date);

// set profile user on comment box
if (facebook.getUid()) {
  var commentBoxAvatar = 'http://graph.facebook.com/' + facebook.getUid() + '/picture?width=120&height=120';
}
else {
  var commentBoxAvatar = '/images/henkie.png';
}
$.current_user_avatar.setImage(commentBoxAvatar);

// set total snapp loves
$.image_love.setTitle(' ' + snapp.total_snapp_loves + ' x');

if (snapp.current_user_rating == 1) {
  $.image_love.setImage('/images/icons/heart.png');
}
else {
  $.image_love.setImage('/images/icons/heart_empty.png');
}

function userSubmitsComment () {
  if (mayUserSend()) {
    postCommentToSnailsnapp();
    $.submitButton.setTitle(L('post_photo_button_posting'));
    $.new_comment.setTouchEnabled(false);
    $.textareaView.setOpacity(0.5);
  }
}

function enableTextArea() {
  $.new_comment.setTouchEnabled(true);
  $.submitButton.setTitle(L('view_photo_comment'));
  $.textareaView.setOpacity(1);
}

// post comments to snailsnapp
function postCommentToSnailsnapp() {

  // upload data to snailsnapp
  uploadToSnailsnapp(
    '/post/snapp/comment',
    function(json) {

      enableTextArea();
      $.new_comment.setValue(L('view_photo_comment_placeholder'));
      addNewComment(json);
    },
    function(message) {

      enableTextArea();
      showErrorAlert(message);
    },
    {
      comment: $.new_comment.value,
      snapp_id: snapp.snapp_id
    }
  );
}

function addNewComment(response) {
  // commentWrapper holds all comments
  var commentWrapper = $.comment_wrapper;

  // newCommentInfo holds the new comment's information
  var newCommentInfo = Ti.UI.createView();
  $.addClass(newCommentInfo, 'detailsView');
  commentWrapper.add(newCommentInfo);

    // profilePic holds the commenter's profile pic
    var commenterProfilePic = Ti.UI.createImageView({
      image: 'http://graph.facebook.com/' + response.fb_user_id + '/picture?width=120&height=120',
    });
    $.addClass(commenterProfilePic, 'avatar');
    newCommentInfo.add(commenterProfilePic);

    // verticalAlign aligns the following three elements vertical
    var verticalAlign = Ti.UI.createView();
    $.addClass(verticalAlign, 'detailsContainer');
    newCommentInfo.add(verticalAlign);

      // commenterUser holds new user name
      var commentUser = Ti.UI.createLabel({
        text: response.fb_full_name,
      });
      $.addClass(commentUser, 'name');
      verticalAlign.add(commentUser);

      // commentDateTime holds the datetime of the comment
      var dateTimeCreated = showLocalDateTime(response.created);
      var commentDateTime = Ti.UI.createLabel({
        text: dateTimeCreated,
      });
      $.addClass(commentDateTime, 'date');
      verticalAlign.add(commentDateTime);

      // comment holds the actual comment and is added under commentWrapper
      var comment = Ti.UI.createLabel({
        text: response.comment,
        bottom: 5,
      });
      $.addClass(comment, 'text');
      verticalAlign.add(comment);

      if (response.current_user_rating == 1) {
        var image = '/images/icons/heart_small.png';
      }
      else {
        var image = '/images/icons/heart_small_empty.png';
      }

      // loveButton
      var loveButton = Ti.UI.createButton({
        image: image,
        title: ' ' + response.total_comment_loves + ' x',
        color: Alloy.CFG.green,
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
        visible: true,
        left: 0,
        snapp_comment_id: response.snapp_comment_id
      });
      $.addClass(loveButton, 'bottomMargin');

      loveButton.addEventListener('click', function(event) {
        giveLove(event, 'comment');
      });

      verticalAlign.add(loveButton);
}

// this shit makes the loving work --> love u fran!
function giveLove(event, type) {
  if (mayUserSend()) {
    toggleLove(event, type);
  }
}

function toggleLove(event, type) {
  var rating;
  var heart     = event.source;
  var image     = heart.getImage();
  var loveCount = parseInt(heart.getTitle());

  if (type == 'comment') {
    var id = heart.snapp_comment_id;
    var elementId = heart;
    var file_prefix = 'heart_small';
  }
  else if (type == 'snapp') {
    var id = snapp.snapp_id;
    var elementId = $.image_love;
    var file_prefix = 'heart';
  }
  else {
    showErrorAlert();
  }

  if (image == '/images/icons/' + file_prefix + '_empty.png') {
    heart.setTitle(' ' + (loveCount + 1) +' x');
    heart.setImage('/images/icons/' + file_prefix + '.png');
    rating = 1;
  }
  else {
    heart.setTitle(' '+ (loveCount - 1) +' x');
    heart.setImage('/images/icons/' + file_prefix + '_empty.png');
    rating = 0;
  }

  uploadLoveToSnailsnapp(elementId, rating, type, id);
}

function uploadLoveToSnailsnapp(elementId, rating, type, id) {
  uploadToSnailsnapp(
    '/post/snapp/loves',
    function(json) {
      if (json.sum_rating) {
        elementId.setTitle(' ' + json.sum_rating +' x');
      }
    },
    function(e) {
      showErrorAlert(e);
    },
    {
      rating: rating,
      type: type,
      id: id
    }
  );
}

function closeViewPhoto() {
  $.viewphoto.close();
}