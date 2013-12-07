<?php
// variables for getting page load time
$debugLoading = false;
$startTime    = microtime(true);
$lastTime     = 0;

if (session_id() == '') {
    session_start();

    // for IE to use the latest version of the engine
    header('X-UA-Compatible: IE=edge,chrome=1');
}

setlocale(LC_ALL, 'NL_nl');
date_default_timezone_set('Europe/Amsterdam');
mb_internal_encoding('UTF-8');

// this is the Ortelius address
// $ourIP = '24.132.29.137'; // ortelius
$ourIP = '41.248.179.42'; // marocco

$isDeveloper   = false;
$isLocalhost   = false;
$useLocalMysql = false;

if (isset($_SERVER['SERVER_ADDR'])
    && ($_SERVER['SERVER_ADDR'] == '127.0.0.1'
        || $_SERVER['SERVER_ADDR'] == '::1'
        || substr($_SERVER['SERVER_ADDR'], 0, 10) == '192.168.1.'
    )
) {
    $isDeveloper = true;
    $isLocalhost = true;
//    $useLocalMysql = true;
}
if (isset($_GET['debug']) || $_SERVER['REMOTE_ADDR'] == $ourIP) {
    $isDeveloper = true;
}

// view errors only when user is developer
if ($isDeveloper) {
    error_reporting(E_ALL);
    ini_set('display_errors','On');
    mysqli_report(MYSQLI_REPORT_ERROR);
}
else {
    error_reporting(NULL);
    ini_set('display_errors','Off');
    mysqli_report(MYSQLI_REPORT_OFF);
}

// set protocol to http or https
$protocol = 'http';
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') {
    $protocol = 'https';
}

if ($isLocalhost) {
    if (substr($_SERVER['SERVER_ADDR'], 0, 10) == '192.168.1.') {
        $apiURL = 'http://'.$_SERVER['HTTP_HOST'].'/api/v1/';
    }
    else {
        $apiURL = 'http://eerstelinks/api/v1/';
    }
    $host = 'dbc1039.ext.intention.nl';
}
else {
    // https is only supported on eerstelinks.nl, so don't use it on other domains.
    if ($_SERVER['HTTP_HOST'] == 'eerstelinks.nl') {
        $apiURL = $protocol.'://'.$_SERVER['HTTP_HOST'].'/api/v1/';
    }
    else {
        $apiURL = 'http://'.$_SERVER['HTTP_HOST'].'/api/v1/';
    }
    $host = 'dbc1039.int.intention.nl';
}

// check for database
if (!defined('DATABASE')) {
    define('DATABASE', 'c2526_sites');
}

// use local database, usefull for Marocco
if ($useLocalMysql) {
    $mysqli = new mysqli('localhost', 'root', 'root', DATABASE);
}
else {
    $mysqli = new mysqli($host, 'eerstelinks_nl', '8dkjj2kv0c63bi', DATABASE);
}

if ($mysqli->connect_error) {
    die('MySQL error: '.$mysqli->connect_errno.'; '.$mysqli->connect_error);
}

// set character set to utf8
// otherwise json_encode() sometimes returns null
// source: http://stackoverflow.com/a/1972335
// use SET NAMES instead of 'SET CHARACTER SET utf8'
// source: http://stackoverflow.com/a/1566908
$mysqli->query('SET NAMES utf8');
$mysqli->query('SET CHARACTER SET utf8');

$pathItems = explode("/", $_SERVER['REQUEST_URI']);
// search for domainname in database if != eerstelinks
if (!empty($_GET['pathname'])) {
    $searchMysql  = "`pathname` LIKE ".cf_quotevalue($_GET['pathname']);
    $nameForError = htmlentities($_GET['pathname']);
    $url_lang_placeholder = '/[LANG]/'.htmlentities($_GET['pathname']);
}
elseif (strpos($_SERVER['HTTP_HOST'], 'eerstelinks') === false && substr($_SERVER['SERVER_ADDR'], 0, 10) != '192.168.1.') {

    // check if there is a language code in url (eg.: http://frankvreeswijk.com/nl)
    if (!isset($current_lang_code) && isset($pathItems[1]) && isset($languages[$pathItems[1]])) {
        $current_lang_code = $pathItems[1];
    }
    $searchMysql  = "`hostname` LIKE ".cf_quotevalue($_SERVER['HTTP_HOST']);
    $nameForError = $_SERVER['HTTP_HOST'];
    $url_lang_placeholder = 'http://'.$_SERVER['HTTP_HOST'].'/[LANG]';
}
elseif (isset($pathItems[1])) {

    // check if the first dir is a language code (eg.: en, nl)
    if (isset($pathItems[2]) && isset($languages[$pathItems[1]])) {
        $pathname             = $pathItems[2];
        if (!isset($current_lang_code)) {
            $current_lang_code    = $pathItems[1];
        }
    }
    else {
        $pathname = $pathItems[1];
    }
    $searchMysql  = "`pathname` LIKE ".cf_quotevalue($pathname);
    $nameForError = $pathname;

    $url_lang_placeholder = '/[LANG]/'.$pathname;

    // used multiple times, so unset after use
    unset($pathname);
}

if (!empty($searchMysql)) {

    $result = $mysqli->query("SHOW TABLES LIKE 'websites'");
    $tableExists = $result->num_rows > 0;

    if ($tableExists) {
        $query = "SELECT * FROM `websites`
            WHERE ".$searchMysql." LIMIT 0,2";
        $result = $mysqli->query($query);

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            $website = $row;
        }
    }
    else {
        $website = false;
    }
}

// set language code default to first element of $website['languages']
// todo: set language code depending on country
if (empty($current_lang_code)) {
    if (isset($website['languages'])) {
        $website_languages = explode(",", $website['languages']);
        $current_lang_code = $website_languages[0];
    }
    else {
        $current_lang_code = 'nl';
    }
}

// set the $lang variable and get it from the json file
// remove every language except the current language
$languageJson  = file_get_contents(dirname(__FILE__).'/lang/lang.json');
$languageArray = json_decode($languageJson, true);
$lang          = cf_getonelang($languageArray, $current_lang_code);

if (isset($website)) {
    $selectedLanguagesArray = explode(",", $website['languages']);
}

$postSafe = cf_htmlentities_array($_POST);
$getSafe  = cf_htmlentities_array($_GET);

?>