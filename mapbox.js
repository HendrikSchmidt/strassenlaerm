mapboxgl.accessToken = 'pk.eyJ1IjoiYXVyZWxmZXJyYXJpIiwiYSI6ImNranZmY3Y1cDA4a2kyb3J2Nm5laDI0Z2wifQ.vlPmQpKXmpGRgmJt6TA10A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/aurelferrari/ckjvfn41e07lx17pat6iapzd3', // stylesheet location
    center: [13.381, 52.522], // starting position [lng, lat]
    zoom: 12 // starting zoom
});

map.on('load', function() {
    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'strassen', function(e) {
        const coordinates = e.features[0].geometry.coordinates.slice()[0];
        const name = e.features[0].properties.name;
        const description = e.features[0].properties.description;
        const html = '<b>' + name + '</b><br/>' + description + '<br/><a href="/objekt/#' + name + '"> > mehr </a>';

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(html)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'strassen', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'strassen', function() {
        map.getCanvas().style.cursor = '';
    });


    map.on('click', 'plaetze', function(e) {
        const coordinates = e.features[0].geometry.coordinates.slice()[0][4];
        const name = e.features[0].properties.name;
        const description = e.features[0].properties.description;
        const html = '<b>' + name + '</b><br/>' + description + '<br/><a href="/objekt/#' + name + '"> > mehr </a>';

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(html)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'plaetze', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'plaetze', function() {
        map.getCanvas().style.cursor = '';
    });
});