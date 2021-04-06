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

const layerMap = [
    { touchLayer: 'viertel', sourceLayer: 'viertel', className: 'quarter-sign'},
    { touchLayer: 'plaetze', sourceLayer: 'plaetze', className: 'streetsign'},
    { touchLayer: 'strassen-touch', sourceLayer: 'strassen', className: 'streetsign'},
    { touchLayer: 'gebaeude', sourceLayer: 'gebaeude', className: 'monument-sign'},
    { touchLayer: 'denkmaeler', sourceLayer: 'denkmaeler', className: 'monument-sign'},
];
let features;
const originalTitle = document.title;

const popupOptions = { maxWidth: '400px',  offset: 30 };
const popup = new mapboxgl.Popup({...popupOptions, closeButton: false});
let hoveredFeature = null;
let selectedFeature = null;
let oldSelection = null;
let fullInfoShown = false;

map.on('load', () => {
    features = map.queryRenderedFeatures({ layers: layerMap.map(l => l.sourceLayer) });
    if(location.hash) loadInformation(parseInt(location.hash.split('-')[0].substr(1)));
    layerMap.map(layer => {
        map.on('mousemove', layer.touchLayer, e => {
            map.getCanvas().style.cursor = 'pointer';

            const id = e.features[0].id;
            // only change popup when hovered over new feature
            if(id !== hoveredFeature?.id) {
                // remove popup and highlight when switching between overlapping features
                popup.remove();
                if(hoveredFeature) removeHighlight(hoveredFeature);
                hoveredFeature = {id, sourceLayer: layer.sourceLayer};
                highlightStreet(hoveredFeature);

                // only show popup for features other than the selected
                if (id !== selectedFeature?.id) {
                    const props = mapObjects[id];
                    const html = `<div class="desc"><h2>${props?.name}</h2></div><div class="more"></div>`;
                    popup
                        .setHTML(html)
                        .addTo(map)
                        .addClassName(layer.className);
                }
            }
            popup.setLngLat(e.lngLat);
        });
        map.on('mouseleave', layer.touchLayer, () => {
            map.getCanvas().style.cursor = '';
            removeHighlight(hoveredFeature);
            hoveredFeature = null;
            popup.remove();
        });
        map.on('click', layer.touchLayer, e => {
            if(fullInfoShown) removeInformation(false);

            const id = e.features[0].id;
            if (selectedFeature) oldSelection = selectedFeature;
            selectedFeature = {id, sourceLayer: layer.sourceLayer};
            highlightStreet(selectedFeature);

            const props = mapObjects[id];
            const html = `<div class="desc"><h2>${props.name}</h2><p>${props.shortDesc}</p></div>`
                       + `<div class="more"><button id="get-object-info"><img src="${assetPrefix}arrow-right.svg" /> ${i18n.more} </button></div>`;
            const expPopup = new mapboxgl.Popup({...popupOptions, className: layer.className});
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

            expPopup.on('close', () => {
                if(oldSelection) {
                    removeHighlight(oldSelection, true);
                    oldSelection = null;
                } else {
                    removeHighlight(selectedFeature);
                    selectedFeature = null;
                }
            });
        });
    })
});

function highlightStreet(feature) {
    map.setFeatureState(
        { source: 'composite', ...feature },
        { highlighted: true }
    );
}

function removeHighlight(feature, old = false) {
    // only remove highlight if the object is either old (and not the same) or neither selected nor hovered
    if (old && oldSelection?.id !== selectedFeature?.id|| selectedFeature?.id !== hoveredFeature?.id) {
        map.setFeatureState(
            { source: 'composite', ...feature },
            { highlighted: false }
        );
    }
}

function loadInformation(id) {
    fullInfoShown = true;
    document.querySelector('object-information').object = mapObjects[id];

    const selectedFeatures = features.filter(f => f.properties.wp_id === id)
    const geometries = selectedFeatures.map(f => f.geometry);
    map.fitBounds(
        getBoundingBox(geometries),
        {padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 4 + 170 + pad}},
    );

    const props = mapObjects[id];
    document.title = `${props.name} (${props.quarter}) | ${originalTitle}`;
    selectedFeature = { id, sourceLayer: selectedFeatures[0]['layer']['source-layer']};
    highlightStreet(selectedFeature);
}

export function removeInformation(flyToMiddle) {
    location.hash = '';
    document.title = originalTitle;
    document.querySelector('object-information').object = null;
    if (flyToMiddle) map.flyTo({center, zoom});
    removeHighlight(selectedFeature);
    selectedFeature = null;
    fullInfoShown = false;
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
