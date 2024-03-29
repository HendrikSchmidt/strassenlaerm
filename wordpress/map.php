<?php /* Template Name: Map */
if ( !defined('ABSPATH') ){ die(); }
global $avia_config, $more;
get_header();
echo avia_title();
do_action( 'ava_after_main_title' );
$args = array(
    'posts_per_page' => -1,
    'category__in' => [149, 151],
    'post_type' =>  'post'
);
if ( !function_exists( 'pll_get_term' ) ) {
    echo pll_get_term(151, '');
}
$map_query = new WP_Query( $args );
$map_objects = [];
if ( $map_query -> have_posts() ) :
    while ( $map_query -> have_posts() ) : $map_query -> the_post();
        $object_data = get_fields();
        $object_data['name']= get_the_title();
        $object_data['permalink']= get_the_permalink();
        $object_data['map-link']= get_the_id() . "-" . basename(get_the_permalink());
        if (function_exists('pll_get_post')) {
            // always use the german post id, as that one is associated to the mapbox features
            $post_id_translated = pll_get_post(get_the_id(), 'de');
            $map_objects[$post_id_translated] = $object_data;
        }
    endwhile;
endif;

echo '<div id="map"><a class="contact" href="https://strassenlaerm.berlin/projekt/#kontakt">';
if (function_exists('pll_e')) {
    pll_e('Schreibt uns');
}
echo '</a><object-information></object-information></div>';

wp_enqueue_script( 'mapbox-gl.js', 'https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.js' );
wp_enqueue_style( 'mapbox-gl.css', 'https://api.mapbox.com/mapbox-gl-js/v2.2.0/mapbox-gl.css' );
wp_enqueue_script( 'bootstrap.bundle.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js' );
wp_enqueue_style( 'bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css' );
wp_enqueue_style( 'map-css', content_url() . '/strassenlaerm/map/map.css' );
wp_enqueue_script( 'object-information-js', content_url() . '/strassenlaerm/map/objectInformation.js', array(), null, true );
wp_enqueue_script( 'strassenlaerm-mapbox-js', content_url() . '/strassenlaerm/map/mapbox.js', array(), null, true );
add_filter('script_loader_tag', 'add_type_attribute' , 100, 3);
function add_type_attribute($tag, $handle, $src) {
    if ( 'object-information-js' == $handle || 'strassenlaerm-mapbox-js' == $handle ) {
        // only replace type for module script and not inline script that is added
        return preg_replace("/type='text\/javascript'(\s*)src/", "type='module' src", $tag);
    }
    return $tag;
}
wp_add_inline_script( 'strassenlaerm-mapbox-js', 'const assetPrefix = "/wp-content/strassenlaerm/map/"', 'before' );
wp_add_inline_script( 'strassenlaerm-mapbox-js', 'const mapObjects = ' . json_encode($map_objects), 'before' );
if (function_exists('pll__')) {
    wp_localize_script( 'strassenlaerm-mapbox-js', 'i18n',
        array(
            'more' => pll__( 'Mehr' ),
            'close' => pll__( 'Schließen' ),
            'toSite' => pll__( 'Seite öffnen' ),
            'currentSituation' => pll__( 'Stand der Umbenennung' ),
            'recommendation' => pll__( 'Unsere Empfehlung' ),
            'notFound' => pll__( 'Objekt nicht gefunden' ),
        )
    );
} else {
    echo "pll__ is not available.<br />\n";
}

wp_footer();
get_footer();
