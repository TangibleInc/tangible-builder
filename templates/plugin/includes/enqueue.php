<?php

// Enqueue styles and scripts

add_action('wp_enqueue_script', function() use ($<%- projectNameSnakeCase %>) {

  $url = $<%- projectNameSnakeCase %>->plugin->url;
  $version = $<%- projectNameSnakeCase %>->plugin->version;

  wp_enqueue_style(
    '<%- projectNameKebabCase %>-css',
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
