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

## Upload of map objects to Mapbox

### Option 1: With existing geodata (strassen, plaetze)
1. Make sure the [Strassenabschnitte.geojson](https://daten.odis-berlin.de/de/dataset/detailnetz_strassenabschnitte/) from ODIS Berlin are in `data-upload/`
2. Add map object with Wordpress `id`, object `name` (that is also in `Strassenabschnitte.geojson` as `strassenna`) and `quarter` (`stadtteil`) to `data-upload/mapobjects.json`
3. `cd data-upload/`
4. `python3 upload_data_to_datasets.py`
5. `python3 update_tilesets.py replace_source <strassen|plaetze>` (choose one or run sequentially)
6. `python3 update_tilesets.py publish_tileset strassenlaerm`

### Option 2: Without existing geodata (viertel, gebaeude, denkmaeler)
1. Add the object manually in [Mapbox Studio](https://studio.mapbox.com/)
    1. Open the relevant [dataset](https://studio.mapbox.com/datasets/)
    2. Draw the object
    3. Add property `wp_id` to object and fill in the Worpress id
    4. Save
2. `cd data-upload/`
3. `python3 upload_data_to_datasets.py`
4. `python3 update_tilesets.py replace_source <viertel|gebaeude|denkmaeler>` (choose one or run sequentially)
5. `python3 update_tilesets.py publish_tileset strassenlaerm`

## Dataflow
For the moment, [mapbox.js](https://github.com/HendrikSchmidt/strassenlaerm/blob/master/map/mapbox.js) depends on the data being loaded into `mapObjects` by [map.php](https://github.com/HendrikSchmidt/strassenlaerm/blob/master/wordpress/map.php), which gets the data from `The Loop`.
