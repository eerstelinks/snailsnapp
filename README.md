Snailsnapp
==========

How to write
------------

We use the term _snailsnapp_ in code and we show _Snailsnapp_ to the public. So in urls use this: [snailsnapp.com](http://snailsnapp.com) or http://eerstelinks.nl/snailsnapp. __Never__ show dashes in the code nor to the public.


In this Repo
------------

Don't upload any images to this repo. We keep this repo clean, so upload images with FTP.


Install Titanium, Titanium SDK & Alloy
--------------------------------------

Check if you have brew installed by typing this in the terminal: `brew -v`, if you don't have brew, install it like this: `ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"`

Check if you have npm installed by typing this in the terminal: `npm -v`, if you don't have npm, install it like this: `brew install node`

Install titanium like this:
```bash
sudo npm install -g alloy
sudo npm install -g titanium
titanium sdk install
titanium setup # run quick setup
```

Setup GIT with using your Mac OS Keychain
```git
git config --global credential.helper osxkeychain
```

To connect eerstelinks to snailsnapp via HTTPS
----------------------------------------------

```php
// set relative path to snailsnapp directory
$path = '../../../www.snailsnapp.com/web/';

// get filename and path from url
// everything after https://eerstelinks.nl/snailsnapp/ except arguments (eg. ?foo=bar)
if (isset($_SERVER['argv'][0]) && stripos($_SERVER['argv'][0], 'path=') === 0) {

  $url = substr($_SERVER['argv'][0], 5);
  $file = dirname(__FILE__).'/'.$path.$url;

  // set the get parameters right if there are any
  if (strpos($_SERVER['REQUEST_URI'], '?') !== false) {
    $urlParams = substr(strstr($_SERVER['REQUEST_URI'], '?'), 1);
    parse_str($urlParams, $_GET);
  }
  else {
    $_GET = array();
  }

  if (file_exists($file)) {
    require $file;
    die();
  }
  elseif (file_exists($file.'.php')) {
    require $file.'.php';
    die();
  }
}

header('HTTP/1.0 404 Not Found');
```

app version 0.1
---------------

* simple app counting down for the app stores
  - date: 15 jan 2014?
* show startup logo
* get your invite here
  - 100 left
  - count down (fake)
* user can invite 1 friend with 1 email
* let users fill in their email for first release


app version 0.2
---------------

* login with facebook
  - we won't publish without your approval
  - import photo
  - say: "You look beautiful on this photo!"
* language intergration from the start
* direct image upload to amazon 3s
* add optional description or hashtags to photos
* show your own snailtrail on the map
* connect photos on snailtrail with slimie line?
* slider by map for dates of photos
* share your snailtrail with others with a link by email / facebook/ twitter / pinterest
* privacy settings panel for defaults:
  - private-first social app
  - public uploads (default: off)
  - public snailtrail (default: off)
  - share automatic to facebook (default: off)
  - store in local photo library (default: on)
  - under the leaf (anonimity) (default: on)
  - language (default: English)
* spinning snail as loading image
* queue photos in the background when not connected to internet
* tutorial
  - log in with your facebook
  - take a photo
  - add optional description nor tags
  - publish to facebook
* save public photo to local photo library


app version 0.3
---------------

* upload images from digital camera
* event tagging with geolocation
* aviary filters
* download your own photos


database

* 1 user has 1 snailtrail
* 1 snailtrail has many photos
* 1 photo has 1 user
* 1 photo can be hidden / public
* 1 photo has 1 location
* 1 photo has 1 datetime
* 1 photo has 1 description
* 1 photo has many tags
* 1 photo can have 1 event


website
-------

* map for public photos
* map for snailtrail