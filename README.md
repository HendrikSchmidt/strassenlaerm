# Straßenlärm
This repository contains the different files that make the map on [strassenlaerm.berlin](strassenlaerm.berlin) work and look how it does.

## Map

### Dependencies
* [mapbox.js](https://docs.mapbox.com/mapbox-gl-js/api/#quickstart)
* [mapbox.css](https://docs.mapbox.com/mapbox-gl-js/api/#quickstart)
* [bootstrap.css](https://getbootstrap.com/docs/5.0/getting-started/introduction/#css)
* [bootstrap.js](https://getbootstrap.com/docs/5.0/getting-started/introduction/#js)

### Development
For local development, just open [local.html](https://github.com/HendrikSchmidt/strassenlaerm/blob/master/map/local.html) in your browser of choice.
It loads the dependencies in the head, applies the style and loads the javascript files that provide the functionality.

? mockdata

### Deployment in Wordpress
The repository needs to be cloned into `wp-content`.

The dependencies are loaded in `functions.php`:
```
...
function child_theme_styles() {
	...
	wp_enqueue_script( 'mapbox-gl.js', 'https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.js' );
	wp_enqueue_style( 'mapbox-gl.css', 'https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.css' );
	wp_enqueue_script( 'bootstrap.bundle.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js' );
	wp_enqueue_style( 'bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css' );
}
...
```

[map.php](https://github.com/HendrikSchmidt/strassenlaerm/blob/master/wordpress/map.php) needs to be added to a theme folder and can then be used as a template for a page.

## Data upload to Mapbox
Coming soon...



## Dataflow
For the moment, [mapbox.js](https://github.com/HendrikSchmidt/strassenlaerm/blob/master/map/mapbox.js) depends on the data being loaded into `mapObjects` by [map.php](https://github.com/HendrikSchmidt/strassenlaerm/blob/master/wordpress/map.php), which gets the data from `The Loop`.
In the future this might be replaced by an API call.

