<?php /* Template Name: Map */
if ( !defined('ABSPATH') ){ die(); }
global $avia_config, $more;
get_header();
echo avia_title();
do_action( 'ava_after_main_title' );
$args = array(
    'numberposts' => -1,
    'category' => 'kartenobjekte',
    'post_type' =>  'post'
);
$map_query = new WP_Query( $args );
$map_objects = [];
if ( $map_query -> have_posts() ) :
    while ( $map_query -> have_posts() ) : $map_query -> the_post();
        $meta_values = get_fields();
        $map_objects[] = $meta_values;
        // Stop the Loop, but allow for a "if not posts" situation
    endwhile;
    // Completely stop the Loop.
endif;
wp_reset_postdata();
?>

<script>
    const mapObjects = <?php echo json_encode($map_objects, JSON_HEX_TAG); ?>;
</script>

<div class="container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>">
    <div class="container">
        <main class="template-map content <?php avia_layout_class( 'content' ); ?> units" <?php avia_markup_helper(array('context' => 'content'));?>>
            <div class="entry-content-wrapper entry-content clearfix">
                <link href="/wp-content/strassenlaerm/map/map.css" rel="stylesheet" />
                <div id="map"><object-information></object-information></div>
                <script type="text/javascript" src="/wp-content/strassenlaerm/map/objectInformation.js"></script>
                <script type="text/javascript" src="/wp-content/strassenlaerm/map/mapbox.js"></script>
            </div><!--end content-->
        </main>
    </div><!--end container-->
</div><!-- close default .container_wrap element -->
<?php
get_footer();
