<?php /* Template Name: Map */
if ( !defined('ABSPATH') ){ die(); }
global $avia_config, $more;
get_header();
echo avia_title();
do_action( 'ava_after_main_title' );
$args = array(
    'post_count' => -1,
    'category_name' => 'kartenobjekte',
    'post_type' =>  'post'
);
$map_query = new WP_Query( $args );
$map_objects = [];
if ( $map_query -> have_posts() ) :
    while ( $map_query -> have_posts() ) : $map_query -> the_post();
        $object_data = get_fields();
        $object_data['name']= get_the_title();
        $object_data['link']= get_the_permalink();
        $map_objects[ get_the_id() ] = $object_data;
    endwhile;
endif;
?>
<div class="container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>">
    <div class="container">
        <main class="template-map content <?php avia_layout_class( 'content' ); ?> units" <?php avia_markup_helper(array('context' => 'content'));?>>
            <div class="entry-content-wrapper entry-content clearfix">
                <div id="map"><object-information></object-information></div>
            </div><!--end content-->
        </main>
    </div><!--end container-->
</div><!-- close default .container_wrap element -->
<?php
//function mapbox_enqueue() {
wp_enqueue_script( 'mapbox-gl.js', 'https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.js' );
wp_enqueue_style( 'mapbox-gl.css', 'https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.css' );
wp_enqueue_script( 'bootstrap.bundle.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js' );
wp_enqueue_style( 'bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css' );
wp_enqueue_style( 'map-css', 'wp-content/strassenlaerm/map/map.css', array(), false, true );
wp_enqueue_script( 'object-information-js', 'wp-content/strassenlaerm/map/objectInformation.js', array(), false, true );
wp_enqueue_script( 'custom-mapbox-js', 'wp-content/strassenlaerm/map/mapbox.js', array(), false, true );
/*wp_add_inline_script( 'custom-mapbox-js', 'const mapObjects = <?php echo json_encode($map_objects); ?>;' );*/
wp_add_inline_script( 'custom-mapbox-js', 'console.log("test");' );
//}
//add_action( 'wp_enqueue_scripts', 'mapbox_enqueue' );
wp_footer();
get_footer();
