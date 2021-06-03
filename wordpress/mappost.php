<?php
/*
 * Template Name: map objects
 * Template Post Type: post
 */
global $avia_config, $post;

if ( post_password_required() )
{
    get_template_part( 'page' ); exit();
}

/*
 * get_header is a basic wordpress function, used to retrieve the header.php file in your theme directory.
 */
get_header();


if( get_post_meta(get_the_ID(), 'header', true) != 'no') echo avia_title();
?>

    <div class='container_wrap container_wrap_first main_color fullsize streetsign-header-container'>
        <div class="container">
            <div class="streetsign-post">
                <h1 class="streetsign-header"><?php the_title();?></h1>
                <h2 class="header-quarter"><?php the_field( "quarter" );?></h2>
            </div>
        </div>
    </div>

    <div class='container_wrap container_wrap_first main_color <?php avia_layout_class( 'main' ); ?>'>

        <div class='container'>

            <main class='template-page content  <?php avia_layout_class( 'content' ); ?> units' <?php avia_markup_helper(array('context' => 'content','post_type'=>'page'));?>>
                <!--Custom html above the visual editor content-->
                <div>

                <?php if( get_field('shortDesc') ): ?>
                    <p><?php do_shortcode(the_field('shortDesc')); ?><p>
                <?php endif; ?>

                <?php if( get_field('longDesc') ): ?>
                    <?php do_shortcode(the_field('longDesc')); ?>
                <?php endif; ?>

                <?php if( get_field('currentSituation') ): ?>
                    <h2><?php if (function_exists('pll_e')) { pll_e( 'Stand der Umbenennung' ); } ?></h2>
                    <p><?php do_shortcode(the_field('currentSituation')); ?><p>
                <?php endif; ?>

                <?php if( get_field('recommendation') ): ?>
                    <h2><?php if (function_exists('pll_e')) { pll_e( 'Unsere Empfehlung' ); } ?></h2>
                    <p><?php do_shortcode(the_field('recommendation')); ?><p>
                <?php endif; ?>

                <?php if( get_field('literature') ): ?>
                    <h2><?php if (function_exists('pll_e')) { pll_e( 'Literatur' ); } ?></h2>
                    <p><?php do_shortcode(the_field('literature')); ?><p>
                <?php endif; ?>

                <?php
                $map_link = '';
                if (function_exists('pll_get_post')) {
                    // always use the german post id, as that one is associated to the mapbox features
                    $post_id_translated = pll_get_post(get_the_id(), 'de');
                    $map_id_DE = 181;
                    $map_id_translated = pll_get_post($map_id_DE);
                    $map_url = get_permalink($map_id_translated);
                    $map_link = $map_url ."#" . $post_id_translated . "-" . basename(get_the_permalink());
                }

                if (function_exists('pll__')) {
                    echo do_shortcode("
                        [av_buttonrow alignment='center' button_spacing='25' button_spacing_unit='px' alb_description='' id='' custom_class='' av_uid='av-kn67dnoz' admin_preview_bg='']
    
                            [av_buttonrow_item label='" . pll__('Zur Karte') . "' icon_select='no' icon='ue843' font='entypo-fontello' link='manually," . $map_link . "' link_target='' size='medium' label_display='' title_attr='' color_options='' color='theme-color' custom_bg='#444444' custom_font='#ffffff' btn_color_bg='theme-color' btn_custom_bg='#444444' btn_color_bg_hover='theme-color-highlight' btn_custom_bg_hover='#444444' btn_color_font='theme-color' btn_custom_font='#ffffff']
                            [av_buttonrow_item label='" . pll__('Zum Verzeichnis') . "' icon_select='no' icon='ue84b' font='entypo-fontello' link='page,172' link_target='' size='medium' label_display='' title_attr='' color_options='' color='theme-color' custom_bg='#444444' custom_font='#ffffff' btn_color_bg='theme-color' btn_custom_bg='#444444' btn_color_bg_hover='theme-color-highlight' btn_custom_bg_hover='#444444' btn_color_font='theme-color' btn_custom_font='#ffffff']
    
                        [/av_buttonrow]
                        
                        [av_social_share title='" . pll__('Beitrag teilen') . "' buttons='custom' share_facebook='aviaTBshare_facebook' share_twitter='aviaTBshare_twitter' share_whatsapp='aviaTBshare_whatsapp' share_mail='aviaTBshare_mail' yelp_link='https://www.yelp.com' style='' alb_description='' id='' custom_class='' av_uid='av-kn67ect2' admin_preview_bg='']
                    ");
                }

                ?>

                </div>
                <!--End /below custom html content-->
            </main>

            <?php
            //get the sidebar if the page options want it
            $avia_config['currently_viewing'] = 'page';
            get_sidebar();
            ?>

        </div><!--end container-->

    </div><!-- close default .container_wrap element -->

<style id="tooltip-arrow"></style>

<script type="application/javascript">
    const main = document.getElementsByTagName('main')[0];
    const tooltips = document.getElementsByClassName('tooltip');
    const positionTooltip = (tooltip) => {
        const tooltiptext = tooltip.getElementsByClassName('tooltiptext')[0];
        const tooltipMiddle = tooltip.offsetLeft + (tooltip.offsetWidth / 2);
        tooltiptext.style.top = `${tooltip.offsetTop + tooltip.offsetHeight}px`;
        tooltiptext.style.left = `${
            Math.min(
                Math.max(0, tooltipMiddle - (tooltiptext.offsetWidth / 2)),
                main.offsetWidth - tooltiptext.offsetWidth)
        }px`;

        document.getElementById('tooltip-arrow').innerHTML = `
        .tooltip .tooltiptext::after { left: ${tooltipMiddle}px; }`;
    }
    const positionTooltips = () => {
        for (const tooltip of tooltips) positionTooltip(tooltip);
    }
    positionTooltips();
    window.onresize = positionTooltips;
</script>

<?php get_footer(); ?>
