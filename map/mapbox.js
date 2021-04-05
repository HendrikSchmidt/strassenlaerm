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

const layers = ['strassen', 'plaetze'];
let features;
let selectedPoint = map.getCenter();
const originalTitle = document.title;

const popupOptions = {
    className: 'streetsign attached',
    maxWidth: '400px',
    offset: 30,
};
const popup = new mapboxgl.Popup({...popupOptions, closeButton: false});
let hoveredFeature = null;
let selectedFeature = null;

map.on('load', () => {
    features = map.queryRenderedFeatures({ layers });
    if(location.hash) loadInformation(parseInt(location.hash.split('-')[0].substr(1)));
    layers.map(layer => {
        map.on('mouseenter', layer, e => {
            map.getCanvas().style.cursor = 'pointer';

            const id = e.features[0].id;
            highlightStreet(id, false);

            const props = mapObjects[id];
            const html = `<div class="desc"><h2>${props.name}</h2></div><div class="more"></div>`;
            popup
                .setHTML(html)
                .addTo(map);
        });
        map.on('mousemove', layer, e => { popup.setLngLat(e.lngLat) });
        map.on('mouseleave', layer, e => {
            map.getCanvas().style.cursor = '';
            removeHighlight(false);
            hoveredFeature = null;
            popup.remove();
        });

        map.on('click', layer, e => {
            removeInformation(false);
            const id = e.features[0].id;
            highlightStreet(id, true);
            selectedPoint = e.lngLat;
            const props = mapObjects[id];
            const html = `<div class="desc"><h2>${props.name}</h2><p>${props.shortDesc}</p></div>`
                       + `<div class="more"><button id="get-object-info"><img src="${assetPrefix}arrow-right.svg" /> ${i18n.more} </button></div>`;

            const expPopup = new mapboxgl.Popup(popupOptions);
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

function highlightStreet(id, selected) {
    if (selected) selectedFeature = id;
    else hoveredFeature = id;
    map.setFeatureState(
        { source: 'composite', id, sourceLayer: 'strassen' },
        { selected: true }
    );
}

function removeHighlight(unselected) {
    if(selectedFeature !== hoveredFeature) {
        map.setFeatureState(
            { source: 'composite', id: unselected ? selectedFeature : hoveredFeature, sourceLayer: 'strassen' },
            { selected: false }
        );
    }
}

function loadInformation(id) {
    document.querySelector('object-information').object = mapObjects[id];

    const geometries = features.filter(f => f.properties.wp_id === id).map(f => f.geometry);
    map.fitBounds(
        getBoundingBox(geometries),
        {padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 4 + 170 + pad}},
    );

    const props = mapObjects[id];
    document.title = `${props.name} (${props.quarter}) | ${originalTitle}`;
    highlightStreet(id, true);
}

export function removeInformation(flyToMiddle) {
    location.hash = '';
    document.title = originalTitle;
    document.querySelector('object-information').object = null;
    if (flyToMiddle) {
        console.log({center, zoom});
        map.flyTo({center, zoom});
    }
    removeHighlight(true);
}

function getBoundingBox(geoms) {
    const points = geoms.flatMap(geom => geom.type === 'LineString' ? geom.coordinates : geom.coordinates.flat());
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
