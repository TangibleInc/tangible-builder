<?php
// global $plugin

// Enqueue frontend styles and scripts

add_action('wp_enqueue_scripts', function() use ($plugin) {

  $url = $plugin->url;
  $version = $plugin->version;

  wp_enqueue_style(
    '<%- projectNameKebabCase %>',
    $url . 'assets/build/<%- projectNameKebabCase %>.min.css',
    [],
    $version
  );

  wp_enqueue_script(
    '<%- projectNameKebabCase %>',
    $url . 'assets/build/<%- projectNameKebabCase %>.min.js',
    ['jquery'],
    $version
  );

});
