<?php
/**
 * Child theme stylesheet einbinden in Abhängigkeit vom Original-Stylesheet
 */

function child_theme_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-theme-css', get_stylesheet_directory_uri() .'/style.css' , array('parent-style'));
}
add_action( 'wp_enqueue_scripts', 'child_theme_styles' );

if(!function_exists('avia_custom_query_extension'))
{
    function avia_custom_query_extension($query, $params)
    {
        global $avia_config;
        if(!empty($avia_config['avia_custom_query_options']['order']))
        {
            $query['order'] = $avia_config['avia_custom_query_options']['order'];
        }

        if(!empty($avia_config['avia_custom_query_options']['orderby']))
        {
            $query['orderby'] = $avia_config['avia_custom_query_options']['orderby'];
        }

        unset($avia_config['avia_custom_query_options']);

        return $query;
    }

    add_filter('avia_masonry_entries_query', 'avia_custom_query_extension', 10, 2);
    add_filter('avia_post_grid_query', 'avia_custom_query_extension', 10, 2);
    add_filter('avia_post_slide_query', 'avia_custom_query_extension', 10, 2);
    add_filter('avia_blog_post_query', 'avia_custom_query_extension', 10, 2);
    add_filter('avf_magazine_entries_query', 'avia_custom_query_extension', 10, 2);

    add_filter('avf_template_builder_shortcode_elements','avia_custom_query_options', 10, 1);
    function avia_custom_query_options($elements)
    {
        $allowed_elements = array('av_blog','av_masonry_entries','av_postslider','av_portfolio','av_magazine');

        if(isset($_POST['params']['allowed']) && in_array($_POST['params']['allowed'], $allowed_elements))
        {
            $elements[] = array(
                "name" => __("Custom Query Orderby",'avia_framework' ),
                "desc" => __("Set a custom query orderby value",'avia_framework' ),
                "id"   => "orderby",
                "type"  => "select",
                "std"   => "",
                "subtype" => array(
                    __('Default Order',  'avia_framework' ) =>'',
                    __('Title',  'avia_framework' ) =>'title',
                    __('Random',  'avia_framework' ) =>'rand',
                    __('Date',  'avia_framework' ) =>'date',
                    __('Author',  'avia_framework' ) =>'author',
                    __('Name (Post Slug)',  'avia_framework' ) =>'name',
                    __('Modified',  'avia_framework' ) =>'modified',
                    __('Comment Count',  'avia_framework' ) =>'comment_count',
                    __('Page Order',  'avia_framework' ) =>'menu_order')
            );

            $elements[] = array(
                "name" => __("Custom Query Order",'avia_framework' ),
                "desc" => __("Set a custom query order",'avia_framework' ),
                "id"   => "order",
                "type"  => "select",
                "std"   => "",
                "subtype" => array(
                    __('Default Order',  'avia_framework' ) =>'',
                    __('Ascending Order',  'avia_framework' ) =>'ASC',
                    __('Descending Order',  'avia_framework' ) =>'DESC'));
        }

        return $elements;
    }

    add_filter('avf_template_builder_shortcode_meta', 'avia_custom_query_add_query_params_to_config', 10, 4);
    function avia_custom_query_add_query_params_to_config($meta, $atts, $content, $shortcodename)
    {
        global $avia_config;
        if(empty($avia_config['avia_custom_query_options'])) $avia_config['avia_custom_query_options'] = array();

        if(!empty($atts['order']))
        {
            $avia_config['avia_custom_query_options']['order'] = $atts['order'];
        }

        if(!empty($atts['orderby']))
        {
            $avia_config['avia_custom_query_options']['orderby'] = $atts['orderby'];
        }

        return $meta;
    }
}

//set builder mode to debug
add_action('avia_builder_mode', "builder_set_debug");
function builder_set_debug()
{
    return "debug";
}

// [tooltip id="2"] Text [/tooltip]

function tooltip__shortcode( $atts, $content = null ) {
    $a = shortcode_atts(
        array (
            'id'   => false,
        ), $atts );

    $id   = $a [ 'id' ];

    // bad id
    if ( ! is_numeric( $id ) ) {
        return '';
    }

    // find the post
    $post = get_post( $id );

    // bad post
    if ( ! $post ) {
        return '';
    }

    $description = $id === get_the_ID() || $id === get_queried_object_id()
        ? '' // no recursive loops!
        : $post->post_content;
//                 : apply_filters( 'the_content', $post->post_content );
    $glossary_link = get_permalink(pll_get_post(2445)) . '#' . $id;
    return '<a href="' . $glossary_link . '" class="tooltip">' . $content . '<span class="tooltiptext"><span class="tooltipheader">' . $post->post_title . '</span>' . $description . '</span></a>';
}

add_shortcode( 'tooltip', 'tooltip__shortcode' );

function add_tooltip_shortcodes( $text ) {
    $args = array('category' => pll_get_term(246));
    $glossary = get_posts($args);
    $pattern_array = [];
    $replacement_array = [];
    foreach ($glossary as $term)  {
        $termID = $term->ID;
        $words_to_replace = explode(',', get_field('words', $termID));
        $pattern_array = array_merge($pattern_array, array_map(fn($word) => '/(^|\s)(' . trim($word) . ')([.]|\s)/i', $words_to_replace));
        $replacement_array = array_merge($replacement_array, array_map(fn() => '$1[tooltip id="' . $termID . '"]$2[/tooltip]$3', $words_to_replace));
    };
    $text_with_shortcodes = preg_replace($pattern_array, $replacement_array, $text);
    return do_shortcode($text_with_shortcodes);
}
add_filter( 'tooltip_shortcodes_filter', 'add_tooltip_shortcodes' );
?>
