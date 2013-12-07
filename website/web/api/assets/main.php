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
    // $useLocalMysql = true;
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
    $host = 'dbc1039.ext.intention.nl';
}
else {
    $host = 'dbc1039.int.intention.nl';
}

// check for database
if (!defined('DATABASE')) {
    define('DATABASE', 'c2526_snailsnapp');
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


?>