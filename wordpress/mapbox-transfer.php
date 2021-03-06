<?php
/**
* Plugin Name: Mapbox Transfer
*/

add_filter('bulk_actions-edit-post', function($bulk_actions) {
    $bulk_actions['transfer-to-mapbox'] = __('In Mapbox laden', 'txtdomain');
    return $bulk_actions;
});

add_filter('handle_bulk_actions-edit-post', function($redirect_url, $action, $post_ids) {
    $map_objects = [];
    if ($action == 'transfer-to-mapbox') {
        foreach ($post_ids as $post_id) {
            $object_data = get_fields($post_id);
            $object_data['name'] = get_the_title($post_id);
            $map_objects[ $post_id ] = $object_data;
        }
        $command = ABSPATH . 'wp-content/strassenlaerm/data-upload/upload_data_to_datasets.py 2>&1';
        echo $command . "\n";
        $output=null;
        $retval=null;
        exec($command, $output, $retval);
        echo "Returned with status $retval and output:\n";
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
