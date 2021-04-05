mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXNzZW5sYWVybSIsImEiOiJja2s0ZHl3YXgxMzFnMndvYmhiY2oyMm5uIn0.jnfXWu8Bb-wd2A9FMo1fEg';
const center = [13.381, 52.522];
const zoom = 10;
const pad = 50;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/strassenlaerm/ckk4e90yl5bid17nyu9uangjg', // stylesheet location
    attributionControl: false,
    center, // starting position [lng, lat]
    zoom, // starting zoom
})
    .addControl(new mapboxgl.FullscreenControl(), 'top-left')
    .addControl(new mapboxgl.NavigationControl(), 'top-left')
    .addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    }), 'top-left')
    .addControl(new mapboxgl.AttributionControl({ customAttribution: 'Geoportal Berlin / Detailnetz - Straßenabschnitte' }));

const layers = ['strassen-touch', 'plaetze'];
let features;
let selectedPoint = map.getCenter();
const originalTitle = document.title;

const popupOptions = {
    className: 'streetsign attached',
    maxWidth: '400px',
    offset: 30,
};
const expPopup = new mapboxgl.Popup(popupOptions);
const popup = new mapboxgl.Popup({...popupOptions, closeButton: false});
// let selectedFeature = null;

map.on('load', () => {
    features = map.queryRenderedFeatures({ layers });
    // console.log(map.getStyle().layers);
    if(location.hash) loadInformation(location.hash.split('-')[0].substr(1));
    layers.map(layer => {
        map.on('mousemove', layer, e => {
            // Change the cursor to a pointer when the mouse is over the places layer.
            map.getCanvas().style.cursor = 'pointer';

            // const props = mapObjects[e.features[0].id];
            const props = mapObjects[e.features[0].id];
            const html = `<div class="desc"><h2>${props.name}</h2></div><div class="more"></div>`;

            // map.setFeatureState(
            //     { source: 'composite', id: id, sourceLayer: 'strassen' },
            //     { selected: true }
            // );

            popup
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
        });
        map.on('mouseleave', layer, () => {
            // Change it back to a pointer when it leaves.
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        map.on('click', layer, e => {
            removeInformation(false);
            const id = e.feature[0].id
            // selectedFeature = e.feature[0].id;
            // map.setFeatureState(
            //     { source: 'composite', id: id, sourceLayer: 'strassen' },
            //     { selected: true }
            // );
            selectedPoint = e.lngLat;
            const props = mapObjects[id];
            const html = `<div class="desc"><h2>${props.name}</h2><p>${props.shortDesc}</p></div>`
                       + `<div class="more"><button id="get-object-info"><img src="${assetPrefix}arrow-right.svg" /> ${i18n.more} </button></div>`;


            expPopup
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map)
                .addClassName('expanded');

            document.getElementById("get-object-info").addEventListener("click", () => {
                expPopup.remove();
                location.hash = `${id}-${props.link.split('/')[3]}`;
                loadInformation(id);
            });
        });

    })
});

function loadInformation(id) {
    // const clickedObj = features.find(feature => feature.properties.wp_id === id);
    const clickedObj = features[0];
    document.querySelector('object-information').object = mapObjects[id];
    const props = mapObjects[id];
    map.fitBounds(
        getBoundingBox(clickedObj.geometry),
        {padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 4 + 170 + pad}},
    );
    document.title = `${props.name} (${props.quarter}) | ${originalTitle}`;
}

export function removeInformation(flyToMiddle) {
    location.hash = '';
    document.title = originalTitle;
    document.querySelector('object-information').object = null;
    if (flyToMiddle) map.flyTo({center, zoom});
}

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

document.onkeydown = evt => { if (evt.key == 'Escape') removeInformation(); };
