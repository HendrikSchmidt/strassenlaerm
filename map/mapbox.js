mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXNzZW5sYWVybSIsImEiOiJja2s0ZHl3YXgxMzFnMndvYmhiY2oyMm5uIn0.jnfXWu8Bb-wd2A9FMo1fEg';
const center = [13.381, 52.522];
const zoom = 10;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/strassenlaerm/ckk4e90yl5bid17nyu9uangjg', // stylesheet location
    // center, // starting position [lng, lat]
    // zoom, // starting zoom
})
    .addControl(new mapboxgl.FullscreenControl(), 'top-left')
    .addControl(new mapboxgl.NavigationControl(), 'top-left')
    .addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    }), 'top-left');

const layers = ['strassen', 'plaetze'];
let features;
let selectedPoint = map.getCenter();

const popupOptions = {
    className: 'streetsign attached',
    maxWidth: '400px',
    offset: 30,
};
const expPopup = new mapboxgl.Popup(popupOptions);
const popup = new mapboxgl.Popup({...popupOptions, closeButton: false});

const id = 340; // just mocked

map.on('load', () => {
    features = map.queryRenderedFeatures({ layers });
    loadDescription();
    layers.map(layer => {
        map.on('mouseenter', layer, e => {
            // Change the cursor to a pointer when the mouse is over the places layer.
            map.getCanvas().style.cursor = 'pointer';

            // const props = mapObjects[e.features[0].id];
            const props = mapObjects[id];
            const html = `<div class="desc"><h2>${props.name}</h2></div><div class="more">1 - 99</div>`;

            popup
                .trackPointer()
                // .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
        });
        map.on('mouseleave', layer, () => {
            // Change it back to a pointer when it leaves.
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        map.on('click', layer, e => {
            selectedPoint = e.lngLat;
            const props = mapObjects[id];
            const html = `<div class="desc"><h2>${props.name} (${props.quarter})</h2><p>${props.shortDesc}</p></div>`
                       + `<div class="more"><a href="#${e.features[0].id}"> > mehr </a></div>`;

            expPopup
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);

            setTimeout(() => expPopup.addClassName('expanded'), 1)
        });

    })
});

function loadDescription() {
    expPopup.remove();
    if(location.hash) {
        // const id = parseInt(location.hash.substr(1));
        const clickedObj = features.find(feature => feature.id === id);
        const props = mapObjects[id];
        document.querySelector('object-information').object = {
            link: props.link,
            infos: [
                {heading: `${props.name} (${props.quarter})`, text: props.longDesc},
                {heading: 'Stand der Umbennenung', text: props.current},
                {heading: 'Quellen', text: props.sources},
            ]
        };
        const pad = 50;
        map.fitBounds(
            getBoundingBox(clickedObj.geometry),
            {padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 3 + pad}},
        );
    } else {
        document.querySelector('object-information').infos = null;
        map.flyTo({center, zoom});
    }
}

window.onhashchange = loadDescription;

function getBoundingBox(geom) {
    const points = geom.type === 'LineString' ? geom.coordinates : geom.coordinates.flat();
    let latitude, longitude, xMin, xMax, yMin, yMax;

    points.forEach(point => {
        longitude = point[0];
        latitude = point[1];
        xMin = xMin < longitude ? xMin : longitude;
        xMax = xMax > longitude ? xMax : longitude;
        yMin = yMin < latitude ? yMin : latitude;
        yMax = yMax > latitude ? yMax : latitude;
    });
    return [[xMin, yMin], [xMax, yMax]];
}

function getBoundingBoxCenter(data) {
    const bbox = getBoundingBox(data);
    let longitude = (bbox[0][0] + bbox[1][0])/2;
    let latitude = (bbox[0][1] + bbox[1][1])/2;
    return [longitude, latitude];
}

