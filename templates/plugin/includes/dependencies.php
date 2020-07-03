<?php

$plugin->register_dependencies([
  'example-plugin/example-plugin.php' => [
    'title' => 'Example plugin',
    'url' => 'https://tangibleplugins.com/example-plugin',
    'fallback_check' => function() {
      return function_exists('example_plugin');
    }
  ],
]);
