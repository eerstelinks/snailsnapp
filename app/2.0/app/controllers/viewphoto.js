// include snailsnapp upload script
Ti.include('/js/upload.js');

// TESTING DATA
snapp_id = '1'; // Should load the right snapp

// always destroy login when closed
$.viewphoto.addEventListener('close', function() {
  $.destroy();
});

// bind placeholder function to description field so it works on iphone
bindPlaceholder($.new_comment, L('view_photo_comment_placeholder'));

function userSubmitsComment () {
  checkFacebookLogin();
  postCommentToSnailsnapp();
  $.submitButton.setTitle(L('post_photo_button_posting'));
  $.new_comment.setTouchEnabled(false);
  $.new_comment_wrapper.setOpacity(0.5);
}

// post comments to snailsnapp
function postCommentToSnailsnapp() {

  // upload data to snailsnapp
  uploadToSnailsnapp(
    '/post/snapp/comment',
    function(response) {
      // success
      $.new_comment.setValue('');
      $.new_comment.setTouchEnabled(true);
      $.submitButton.setTitle(L('view_photo_comment'));
      $.new_comment_wrapper.setOpacity(1);
      addNewComment(response);
    },
    function(e) {
      //error
      showErrorAlert(e);
    },
    {
      comment: $.new_comment.value,
      snapp_id: snapp_id,
      created: new Date()
    }
  );
}


function addNewComment(response) {
  // commentWrapper holds all comments
  var commentWrapper   = $.comment_wrapper;

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
      image: 'http://graph.facebook.com/' + response.fb_user_id + '/picture?width=100&height=100',
      width: '50dp',
      height: '50dp'
    });

    newCommentInfo.add(commenterProfilePic);

    // verticalAlign aligns the following three elements vertical
    var verticalAlign = Ti.UI.createView({
      height: Ti.UI.SIZE,
      layout: 'vertical',
      left: '5'
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
          fontSize: '15dp'
        },
        text: response.created,
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
          color: Alloy.CFG.green,
          style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
          visible: true,
          top: 0,
          left: 0,
          height: Ti.UI.SIZE
        }); // ID AND ONCLICK HAVE TO BE ADDED LATER

        loveInfo.add(loveButton);

        // loveCounter
        var loveCounter = Ti.UI.createLabel({
            text: '0 x',
            color: Alloy.CFG.green,
            bottom: 5,
            left: 5,
            height: Ti.UI.SIZE,
            font: {
              fontFamily: 'Helvetica',
              fontSize: '15dp'
            }
        });

        loveInfo.add(loveCounter);

  // comment holds the actual comment and is added under commentWrapper
  var comment = Ti.UI.createLabel({
    height: Ti.UI.SIZE,
    left: 5,
    right: 5,
    text: response.comment
  });

  commentWrapper.add(comment);

  // finally add a new separator
  var separator = Ti.UI.createView({
    height: 1,
    bottom: 10,
    top: 11,
    left: 5,
    right: 5,
    borderWidth: 1,
    borderColor: Alloy.CFG.green
  });

  commentWrapper.add(separator);
}

function closeViewPhoto() {
  $.viewphoto.close();
}