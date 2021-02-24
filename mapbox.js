mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXNzZW5sYWVybSIsImEiOiJja2s0ZHl3YXgxMzFnMndvYmhiY2oyMm5uIn0.jnfXWu8Bb-wd2A9FMo1fEg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/strassenlaerm/ckk4e90yl5bid17nyu9uangjg', // stylesheet location
    center: [13.381, 52.522], // starting position [lng, lat]
    zoom: 10 // starting zoom
});

const layers = ['strassen', 'plaetze'];

map.on('load', () => {
    layers.map(layer => {
        map.on('click', layer, (e) => {
            const coordinates = calcCenterPoint(e, layer);
            const name = e.features[0].properties.name;
            const description = e.features[0].properties.description;
            const html = '<b>' + name + '</b><br/>' + description + '<br/><a href="/objekt/#' + name + '"> > mehr </a>';

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(html)
                .addTo(map);
        });

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.on('mouseenter', layer, (e) => {
            // Change the cursor to a pointer when the mouse is over the places layer.
            map.getCanvas().style.cursor = 'pointer';

            const coordinates = calcCenterPoint(e, layer);
            const description = e.features[0].properties.name;

            popup
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });
        map.on('mouseleave', layer, () => {
            // Change it back to a pointer when it leaves.
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    })
});

const calcCenterPoint = (e, layer) => {
    const coords = e.features[0].geometry.coordinates;
    let centerPoint = [];
    if(layer === 'plaetze') {
        // for a place (polygon), calculate the center to display the popup there
        const summedCoords = coords[0].reduce((sum, coord) => [sum[0] + coord[0], sum[1] + coord[1]]);
        const numCoords = coords[0].length;
        centerPoint = [ summedCoords[0] / numCoords, summedCoords[1] / numCoords ];
    } else if (layer === 'strassen') {
        // for a street (line segments), take the center point (odd number of points)
        // or the middle between the two middle points (even number of points)
        const numCoords = coords.length;
        if (numCoords % 2 === 1) {
            centerPoint = coords[ numCoords - 1 / 2 ]
        } else {
            const firstPoint = coords[ numCoords / 2 - 1];
            const secondPoint = coords[ numCoords / 2 ]
            centerPoint = [ ( firstPoint[0] + secondPoint[0] ) / 2 , ( firstPoint[1] + secondPoint[1] ) / 2 ]
        }
    }

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - centerPoint[0]) > 180) {
        centerPoint[0] += e.lngLat.lng > centerPoint[0] ? 360 : -360;
    }

    return centerPoint;
}