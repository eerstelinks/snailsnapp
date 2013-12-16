<?php

function cf_implode_mysqli($array, $specialchars = true, $separator = ', ') {
    foreach ($array as $key => $value) {
        $fields[] = '`'.$key.'` = '.cf_quotevalue($value, $specialchars);
    }
    return implode($separator, $fields);
}

function cf_quotevalue($value, $specialchars = true) {
    global $mysqli;

    if (get_magic_quotes_gpc()) {
        $value = stripslashes($value);
    }
    if (!is_int($value)) {
        $value = "'".$mysqli->real_escape_string($value)."'";
    }

    if ($specialchars === true) {
        return htmlspecialchars($value);
    }
    else {
        return $value;
    }
}

?>