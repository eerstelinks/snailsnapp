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

$.snapp.setImage(snapp.url_phone);

function userSubmitsComment () {
  if (mayUserSend()) {
    postCommentToSnailsnapp();
    $.submitButton.setTitle(L('post_photo_button_posting'));
    $.new_comment.setTouchEnabled(false);
    $.new_comment_wrapper.setOpacity(0.5);
  }
}

function enableTextArea() {
  $.new_comment.setTouchEnabled(true);
  $.submitButton.setTitle(L('view_photo_comment'));
  $.new_comment_wrapper.setOpacity(1);
}

// post comments to snailsnapp
function postCommentToSnailsnapp() {

  // upload data to snailsnapp
  uploadToSnailsnapp(
    '/post/snapp/comment',
    function(json) {

      enableTextArea();
      $.new_comment.setValue('');
      addNewComment(json);
    },
    function(message) {

      enableTextArea();
      showErrorAlert(message);
    },
    {
      comment: $.new_comment.value,
      snapp_id: snapp.snapp_id,
      created: new Date()
    }
  );
}

function addNewComment(response) {
  // commentWrapper holds all comments
  var commentWrapper = $.comment_wrapper;

  // newCommentView will hold the new comment
  var newCommentView = Ti.UI.createView({
    height: Ti.UI.SIZE,
    top: 5
  });

  commentWrapper.add(newCommentView);

  // newCommentInfo holds the new comment's information
  var newCommentInfo = Ti.UI.createView({
      layout: 'horizontal',
      horizontalWrap: true,
      width: '100%',
      height: Ti.UI.SIZE
  });

  newCommentView.add(newCommentInfo);

    // profilePic holds the commenter's profile pic
    var commenterProfilePic = Ti.UI.createImageView({
      top: 0,
      left: 5,
      image: 'http://graph.facebook.com/' + response.fb_user_id + '/picture?width=150&height=150',
      width: '75dp',
      height: '75dp'
    });

    newCommentInfo.add(commenterProfilePic);

    // verticalAlign aligns the following three elements vertical
    var verticalAlign = Ti.UI.createView({
      height: Ti.UI.SIZE,
      layout: 'vertical',
      top: 0,
      left: 5
    });

    newCommentInfo.add(verticalAlign);

      // commenterUser holds new user name
      var commentUser = Ti.UI.createLabel({
        font: {
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fontSize: '16dp'
        },
        text: response.fb_full_name,
        top: 0,
        left: 0,
        height: Ti.UI.SIZE
      });

      verticalAlign.add(commentUser);

      // commentDateTime holds the datetime of the comment
      var commentDateTime = Ti.UI.createLabel({
        font: {
          fontFamily: 'Helvetica',
          fontSize: '14dp'
        },
        text: response.created,
        color: Alloy.CFG.darkgrey,
        left: 0,
        height: Ti.UI.SIZE
      });

      verticalAlign.add(commentDateTime);

      // loveInfo holds the love elements
      var loveInfo = Ti.UI.createView({
        layout: 'horizontal',
        horizontalWrap: true,
        left: 0,
        height: Ti.UI.SIZE
      });

      verticalAlign.add(loveInfo);

        // loveButton
        var loveButton = Ti.UI.createButton({
          image: '/images/icons/heart-empty.png',
          title: ' ' + response.total_comment_loves + ' x',
          color: Alloy.CFG.green,
          style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
          visible: true,
          top: 5,
          left: 0,
          height: Ti.UI.SIZE,
          snapp_comment_id: response.snapp_comment_id
        });
        loveButton.addEventListener('click',function(event) {
          giveLove(event);
        });

        loveInfo.add(loveButton);

  // comment holds the actual comment and is added under commentWrapper
  var comment = Ti.UI.createLabel({
    height: Ti.UI.SIZE,
    left: 5,
    right: 5,
    top: 5,
    text: response.comment
  });

  commentWrapper.add(comment);

  // finally add a new separator
  var separator = Ti.UI.createView({
    height: 1,
    bottom: 5,
    top: 6,
    left: 5,
    right: 5,
    borderWidth: 1,
    borderColor: Alloy.CFG.green
  });

  commentWrapper.add(separator);
}

// this shit makes the loving work --> love u fran!
function giveLove(event) {
  if (mayUserSend()) {
  toggleLove(event);
  }
}

function toggleLove(event) {
  var rating;
  var heart     = event.source;
  var title     = heart.getTitle();
  var image     = heart.getImage();
  var loveCount = parseInt(title);

  // this might need a check on whether the var exist
  var snapp_id = event.snapp_id; // is not send from server yet
  var snapp_comment_id = event.snapp_comment_id;

  if (image == '/images/icons/heart-empty.png') {
    heart.setTitle(' ' + (loveCount + 1) +' x');
    heart.setImage('/images/icons/heart.png');
    rating = 1;
  }
  else {
    heart.setTitle(' '+ (loveCount - 1) +' x');
    heart.setImage('/images/icons/heart-empty.png');
    rating = 0;
  }
  uploadLoveToSnailsnapp(rating,snapp_id,snapp_comment_id);
}

function uploadLoveToSnailsnapp(rating,snapp_id,snapp_comment_id) {
  uploadToSnailsnapp(
    '/post/snapp/loves',
    function() {
      // successCallback
      alert('success');
    },
    function() {
      //errorCallback
      showErrorAlert(e);
    },
    {
      rating: rating,
      snapp_id: snapp_id,
      snapp_comment_id: snapp_comment_id
    }
  );
}

function closeViewPhoto() {
  $.viewphoto.close();
}