<?php
/**
 * Plugin Name: <%- tangibleProjectTitle %>
 * Plugin URI: https://tangibleplugins.com/<%- projectNameKebabCase %>
 * Description: <%- projectDescription %>
 * Version: 0.0.1
 * Author: Team Tangible
 * Author URI: https://teamtangible.com
 * License: GPLv2 or later
 */

define( '<%- projectNameConstantCase %>_VERSION', '0.0.1' );

require __DIR__ . '/vendor/tangible/plugin-framework/index.php';

/**
 * Get plugin instance
 */
function <%- projectNameSnakeCase %>($instance = false) {
  static $plugin;
  return $plugin ? $plugin : ($plugin = $instance);
}

add_action('plugins_loaded', function() {

  $framework = tangible();
  $plugin    = $framework->register_plugin([
    'name'           => '<%- projectNameKebabCase %>',
    'title'          => '<%- projectMenuTitle %>',
    'setting_prefix' => '<%- projectNameSnakeCase %>',

    'version'        => <%- projectNameConstantCase %>_VERSION,
    'file_path'      => __FILE__,
    'base_path'      => plugin_basename( __FILE__ ),
    'dir_path'       => plugin_dir_path( __FILE__ ),
    'url'            => plugins_url( '/', __FILE__ ),
    'assets_url'     => plugins_url( '/assets', __FILE__ ),

    'item_id'        => false, // Product ID on Tangible Plugins store
    'multisite'      => false,
  ]);

  <%- projectNameSnakeCase %>( $plugin );

  // Features loaded will have $framework and $plugin in their scope

  require_once __DIR__.'/includes/index.php';

}, 10);
