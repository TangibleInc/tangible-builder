<?php

add_action( 'wp_enqueue_scripts', function() {

  $url = get_stylesheet_directory_uri();

  // Change version after theme update, to ensure browser cache of script/style is cleared
  $version = '20200306';

  wp_enqueue_script('<%- projectKebabCase %>-theme', "$url/assets/build/script.min.js", ['jquery'], $version);
  wp_enqueue_style('<%- projectKebabCase %>-theme-css', "$url/assets/build/style.min.css", [], $version);

}, 1000);
