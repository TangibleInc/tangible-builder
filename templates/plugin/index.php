<?php
/**
 * Plugin Name: Tangible: <%- projectTitle %>
 * Plugin URI: https://tangibleplugins.com/<%- projectNameKebabCase %>
 * Description: <%- projectDescription %>
 * Version: 0.0.1
 * Author: Team Tangible
 * Author URI: https://teamtangible.com
 * License: GPLv2 or later
 */

define( '<%- projectNameConstantCase %>_VERSION', '0.0.1' );

require __DIR__ . '/vendor/tangible/plugin-framework/index.php';

class <%- projectNamePascalCase %> {

  use TangibleObject;

  public $name  = '<%- projectNameSnakeCase %>';
  public $state = [];

  function __construct() {

    add_action( tangible_plugin_framework()->ready, [ $this, 'register' ] );
  }

  function register( $framework ) {

    $<%- projectNameSnakeCase %> = $this;

    $<%- projectNameSnakeCase %>->plugin = $framework->register_plugin([
      'name'           => '<%- projectNameKebabCase %>',
      'title'          => '<%- projectTitle %>',
      'setting_prefix' => '<%- projectNameSnakeCase %>',

      'version'        => <%- projectNameConstantCase %>_VERSION,
      'file_path'      => __FILE__,
      'base_path'      => plugin_basename( __FILE__ ),
      'dir_path'       => plugin_dir_path( __FILE__ ),
      'url'            => plugins_url( '/', __FILE__ ),

      'item_id'        => false, // Product ID on Tangible Plugins store
      'multisite'      => false,
    ]);

    // Features loaded will have $framework and $<%- projectNameSnakeCase %> in their scope

    require __DIR__.'/includes/index.php';
  }
}

/**
 * Get plugin instance
 */
function <%- projectNameSnakeCase %>() {
  static $o;
  if ($o) return $o;
  return $o = new <%- projectNamePascalCase %>();
}

<%- projectNameSnakeCase %>();
