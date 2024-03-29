<?php
/**
* Plugin Name: Strassenlaerm Mapbox
* Description: This Plugin adds the bulk action to transfer map objects to Mapbox as well as adding the translatable strings used in the displayed map.
* Author: Hendrik
*/

add_filter('bulk_actions-edit-post', function($bulk_actions) {
    $bulk_actions['transfer-to-mapbox'] = __('In Mapbox laden', 'txtdomain');
    return $bulk_actions;
});

add_filter('handle_bulk_actions-edit-post', function($redirect_url, $action, $post_ids) {
    $map_objects = [];
    if ($action == 'transfer-to-mapbox') {
        foreach ($post_ids as $post_id) {
            echo "{ \"id\": \"";
            echo $post_id;
            echo "\", \"name\": \"";
            echo get_field('geoName', $post_id);
            echo "\", \"quarter\": \"";
            echo get_field('quarter', $post_id);
            echo "\" },\r\n";
            $object_data = get_fields($post_id);
            $object_data['name'] = get_the_title($post_id);
            $map_objects[ $post_id ] = $object_data;
        }
        $command = ABSPATH . 'wp-content/strassenlaerm/data-upload/upload_data_to_datasets.py 2>&1';
//        echo $command . "\n";
        $output=null;
        $retval=null;
        exec($command, $output, $retval);
//        echo "Returned with status $retval and output:\n";
        print_r($output);
        $redirect_url = add_query_arg('transfered-to-mapbox', $output, $redirect_url);
    }
    return $redirect_url;
}, 10, 3);

add_action('admin_notices', function() {
    if (!empty($_REQUEST['transfered-to-mapbox'])) {
        $num_changed = (int) $_REQUEST['transfered-to-mapbox'];
        printf('<div id="message" class="updated notice is-dismissible"><p>' . __('Transfered %d objects to Mapbox.', 'txtdomain') . '</p></div>', $num_changed);
    }
});

add_action( 'plugins_loaded', 'add_polylang_strings' );

function add_polylang_strings() {
    $group = 'Mapbox';
    if (function_exists('pll_register_string')) {
        pll_register_string( 'more', 'Mehr', $group );
        pll_register_string( 'close', 'Schließen', $group );
        pll_register_string( 'toSite', 'Seite öffnen', $group );
        pll_register_string( 'toMap', 'Zur Karte', $group );
        pll_register_string( 'toDirectory', 'Zum Verzeichnis', $group );
        pll_register_string( 'shareObject', 'Beitrag teilen', $group );
        pll_register_string( 'currentSituation', 'Stand der Umbenennung', $group );
        pll_register_string( 'recommendation', 'Unsere Empfehlung', $group );
        pll_register_string( 'literature', 'Literatur', $group );
        pll_register_string( 'author', 'Autor:in', $group );
        pll_register_string( 'notFound', 'Objekt nicht gefunden', $group );
        pll_register_string( 'contactUs', 'Schreibt uns', $group );
    } else {
        echo "pll_register_string is not available.<br />\n";
    }
}
