mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXNzZW5sYWVybSIsImEiOiJja2s0ZHl3YXgxMzFnMndvYmhiY2oyMm5uIn0.jnfXWu8Bb-wd2A9FMo1fEg';
const center = [13.381, 52.522];
const zoom = 10;
const bounds = [[13.075, 52.35], [13.775, 52.675]];
let lastPosition = { center, zoom };
const pad = 50;

const sizeMap = () => {
    const header = document.getElementById('header');
    const headerHeight = header?.getBoundingClientRect().bottom ?? 0;
    document.getElementById('map').style.height = `${window.innerHeight - headerHeight}px`;
}
sizeMap();
window.onresize = sizeMap;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/strassenlaerm/ckk4e90yl5bid17nyu9uangjg', // stylesheet location
    attributionControl: false,
    center, // starting position [lng, lat]
    zoom, // starting zoom
    bounds,
})
    .addControl(new mapboxgl.FullscreenControl(), 'top-left')
    .addControl(new mapboxgl.NavigationControl(), 'top-left')
    .addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    }), 'top-left')
    .addControl(new mapboxgl.AttributionControl({ customAttribution: 'Geoportal Berlin / Detailnetz - Straßenabschnitte' }));

const layerMap = [
    { touchLayer: 'viertel', sourceLayer: 'viertel', className: 'sign quarter'},
    { touchLayer: 'plaetze', sourceLayer: 'plaetze', className: 'sign street'},
    { touchLayer: 'strassen-touch', sourceLayer: 'strassen', className: 'sign street'},
    { touchLayer: 'gebaeude', sourceLayer: 'gebaeude', className: 'sign street'},
    { touchLayer: 'denkmaeler', sourceLayer: 'denkmaeler', className: 'sign street'},
];
let features;
const originalTitle = document.title;

const popupOptions = { maxWidth: '400px',  offset: 30 };
const popup = new mapboxgl.Popup({...popupOptions, closeButton: false, className: ''});
let hoveredFeature = null;
let selectedFeature = null;
let oldSelection = null;
let fullInfoShown = false;

map.on('load', () => {
    // features = layerMap.flatMap(layer =>
    //     map.querySourceFeatures('composite', {sourceLayer: layer.sourceLayer}).map(
    //         feature => ({
    //             ...feature,
    //             sourceLayer: layer.sourceLayer,
    //         })
    //     ),
    // );
    features = map.queryRenderedFeatures({ layers: layerMap.map(l => l.sourceLayer) });
    if(location.hash !== '') {
        try {
            loadInformation(location.hash.split('-')[0].substr(1));
        }
        catch (error) {
            // remove hash and show toast to notify failure
            location.hash = '';
            let errorToast = document.createElement("DIV");
            errorToast.innerHTML = `
                <div class="toast position-absolute top-50 start-50 translate-middle" role="alert" aria-live="assertive" aria-atomic="true">
                  <div class="d-flex">
                    <div class="toast-body">${i18n.notFound}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                  </div>
                </div>`;
            document.getElementById('map').appendChild(errorToast);
            var toastElList = [].slice.call(document.querySelectorAll('.toast'));
            var toastList = toastElList.map(function (toastEl) {
                let toast =  new bootstrap.Toast(toastEl, { autohide: true });
                toast.show();
                return toast;
            })
            console.error(error);
        }
    }
    layerMap.map(layer => {
        map.on('mousemove', layer.touchLayer, e => {
            map.getCanvas().style.cursor = 'pointer';

            const id = e.features[0].id;

            // only change popup when hovered over new feature
            if(id !== hoveredFeature?.id) {
                // remove popup and highlight when switching between overlapping features
                if(hoveredFeature) removeHighlight(hoveredFeature);
                hoveredFeature = {id, sourceLayer: layer.sourceLayer};
                highlightStreet(hoveredFeature);

                // only show popup for features other than the selected
                // and only when not hovering over selected
                // const features = map.queryRenderedFeatures(e.point, { layers: [selectedFeature?.sourceLayer] });
                if (id !== selectedFeature?.id) {
                    const wp_id = e.features[0].properties['wp_id'];
                    const props = mapObjects[wp_id];
                    const html = `<div class="desc"><h2>${props?.name}</h2></div><div class="more"></div>`;
                    popup
                        .setHTML(html)
                        .addTo(map)
                        .setLngLat(e.lngLat);
                    layer.className.split(' ').map(className => popup.addClassName(className));
                } else {
                    popup.remove();
                }
            }
            popup.setLngLat(e.lngLat);
        });
        map.on('mouseleave', layer.touchLayer, () => {
            map.getCanvas().style.cursor = '';
            if (hoveredFeature) {
                removeHighlight(hoveredFeature);
                hoveredFeature = null;
                popup.remove();
            }
        });
        map.on('click', layer.touchLayer, e => {
            // only enable click on uppermost layer by comparing against currently hovered feature
            if(layer.sourceLayer === hoveredFeature.sourceLayer) {
                if (fullInfoShown) removeInformation(false);

                const id = e.features[0].id;
                if (selectedFeature) oldSelection = selectedFeature;
                selectedFeature = {id, sourceLayer: layer.sourceLayer};
                highlightStreet(selectedFeature);

                const wp_id = e.features[0].properties['wp_id'];
                const props = mapObjects[wp_id];
                const html = `<div class="desc"><h2>${props?.name}</h2>${props?.shortDesc}</div>`
                    + `<div class="more"><button id="get-object-info-${wp_id}"><img src="${assetPrefix}arrow-right.svg" /> ${i18n.more} </button></div>`;
                const expPopup = new mapboxgl.Popup({...popupOptions, className: layer.className});
                expPopup
                    .setHTML(html)
                    .addTo(map)
                    .setLngLat(e.lngLat)
                    .addClassName('expanded');

                document.getElementById("get-object-info-" + wp_id).addEventListener("click", () => {
                    expPopup.remove();
                    location.hash = props['map-link'];
                    loadInformation(wp_id);
                });

                // reacts on clicking anywhere else, on 'x' and 'more'
                // behaviour change depending on whether the user switches from one feature to another, or selects a new one
                expPopup.on('close', () => {
                    if (oldSelection) {
                        removeHighlight(oldSelection, true);
                        oldSelection = null;
                    } else {
                        removeHighlight(selectedFeature);
                        selectedFeature = null;
                    }
                });
            }
        });
    })
});

map.on('moveend', () => {
    features = {
        ...features,
        ...map.queryRenderedFeatures({ layers: layerMap.map(l => l.sourceLayer) })
    };
});

map.on('zoomstart', () => {
    lastPosition = {
        center: map.getCenter(),
        zoom: map.getZoom(),
    }
});

function highlightStreet(feature) {
    map.setFeatureState(
        { source: 'composite', ...feature },
        { highlighted: true }
    );
}

function removeHighlight(feature, old = false) {
    // only remove highlight if the object is either old (and not the same) or neither selected nor hovered
    if (old && oldSelection?.id !== selectedFeature?.id || selectedFeature?.id !== hoveredFeature?.id) {
        map.setFeatureState(
            { source: 'composite', ...feature },
            { highlighted: false }
        );
    }
}

function loadInformation(wpId) {
    const selectedFeatures = features.filter(f => parseInt(f.properties.wp_id) === parseInt(wpId));
    const geometries = selectedFeatures.map(f => f.geometry);
    const bbox = getBoundingBox(geometries);
    try {
        map.fitBounds(
            bbox,
            {
                maxZoom: 16,
                padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 4 + 170 + pad}
            },
        );
    } catch (error) {
        map.flyTo({
            center: bbox.getCenter(),
            zoom: 13.5,
            padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 4 + 170 + pad},
        });
        console.error(error);
    }

    const props = mapObjects[wpId];
    document.title = `${htmlDecode(props.name)} (${htmlDecode(props.quarter)}) | ${originalTitle}`;
    const sourceLayer = selectedFeatures[0]['sourceLayer'];
    selectedFeature = { id: selectedFeatures[0].id, sourceLayer};
    highlightStreet(selectedFeature);
    fullInfoShown = true;
    document.querySelector('object-information').object = {
        ...props,
        className: layerMap.find(f => f.sourceLayer === sourceLayer).className,
    };
}

export function removeInformation(flyToLastPosition) {
    location.hash = '';
    document.title = originalTitle;
    document.querySelector('object-information').object = null;
    if (flyToLastPosition) map.flyTo(lastPosition);
    removeHighlight(selectedFeature);
    selectedFeature = null;
    fullInfoShown = false;
}

function getBoundingBox(geoms) {
    let points;
    console.log(geoms);
    switch (geoms[0].type) {
        case 'Point':
            points = [geoms[0].coordinates];
            break;
        case 'LineString':
            points = geoms.flatMap(geom => geom.coordinates);
            break;
        case 'MultiLineString':
            points = geoms.flatMap(geom => geom.coordinates.flat());
            break;
        case 'Polygon':
            points = geoms.flatMap(geom => geom.coordinates.flat());
            break;
        default:
            console.error('Can\'t read geometry of object.')
    }
    let latitude, longitude, xMin, xMax, yMin, yMax;
    console.log(points);

    points.forEach(point => {
        longitude = point[0];
        latitude = point[1];
        xMin = xMin < longitude ? xMin : longitude;
        xMax = xMax > longitude ? xMax : longitude;
        yMin = yMin < latitude ? yMin : latitude;
        yMax = yMax > latitude ? yMax : latitude;
    });
    return new mapboxgl.LngLatBounds([xMin, yMin], [xMax, yMax]);
}

function htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

document.onkeydown = evt => { if (evt.key == 'Escape') removeInformation(); };
