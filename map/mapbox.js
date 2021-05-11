mapboxgl.accessToken = 'pk.eyJ1Ijoic3RyYXNzZW5sYWVybSIsImEiOiJja2s0ZHl3YXgxMzFnMndvYmhiY2oyMm5uIn0.jnfXWu8Bb-wd2A9FMo1fEg';
const center = [13.381, 52.522];
const zoom = 10;
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

map.on('zoomstart', function() {
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
    // console.log('wpId', parseInt(wpId))
    const selectedFeatures = features.filter(f => parseInt(f.properties.wp_id) === parseInt(wpId));
    console.log(features.length);
    console.log(features);
    console.log(selectedFeatures);
    console.log(Object.entries(mapObjects).length);
    console.log(mapObjects);
    console.log(mapObjects[wpId]);
    const geometries = selectedFeatures.map(f => f.geometry);
    map.fitBounds(
        getBoundingBox(geometries),
        {
            maxZoom: 16,
            padding: {top: pad, bottom: pad, left: pad, right: window.innerWidth / 4 + 170 + pad}
        },
    );

    const props = mapObjects[wpId];
    document.title = `${htmlDecode(props.name)} (${htmlDecode(props.quarter)}) | ${originalTitle}`;
    const sourceLayer = selectedFeatures[0]['layer']['source-layer'];
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

function htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

document.onkeydown = evt => { if (evt.key == 'Escape') removeInformation(); };

class ObjectInformation extends HTMLElement {
    constructor() {
        super();
        this.collapseElems = [];
        this.innerHTML = `
            <div id="object-information">
                <div class="pole">&nbsp;</div>
                <div class="accordion accordion-flush" id="object-information-list"></div>
                <div class="traffic-light">
                    <div class="light-casing">
                        <button id="go-back-home" class="light" data-bs-toggle="tooltip" data-bs-placement="left" title="${i18n.close}"></button>
                    </div>
                    <div class="light-casing">
                        <a id="go-to-street" class="light" data-bs-toggle="tooltip" data-bs-placement="left" title="${i18n.toSite}"></a>
                    </div>
                </div>
            </div>
        `;
        this.$objectInformation = this.querySelector('#object-information');
        this.$objectInformationList = this.querySelector('#object-information-list');
        this.$streetLink = this.querySelector('#go-to-street');
        const tooltipTriggerList = [].slice.call(this.querySelectorAll('[data-bs-toggle="tooltip"]'));
        this.tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
        this.querySelector('#go-back-home').addEventListener("click", () => {
            removeInformation(true);
            // disable to prevent buggy display
            this.tooltipList.forEach(tooltip => {tooltip.hide(); tooltip.disable()});
        });
    }

    showHintOnFirstLoad() {
        if (window.sessionStorage.getItem('wasLoadedBefore') !== 'true') {
            this.tooltipList.forEach(tooltip => tooltip.show());
            setTimeout(() => this.tooltipList.forEach(tooltip => tooltip.hide()), 3000);
            window.sessionStorage.setItem('wasLoadedBefore', 'true');
        }
    }

    set object(value){
        console.log(value);
        this._object = value;
        this.collapseElems.forEach(elem => elem.hide());
        const otherObjectDisplayed = this.$objectInformation.classList.contains('unfolded');
        this.$objectInformation.classList.remove('unfolded');
        // hide mapbox controls when screen too small
        if (window.innerWidth <= 600) {
            document.querySelector('.mapboxgl-ctrl-top-left').style.display = this._object ? 'none' : 'block';
        }
        // if an object is already displayed, wait for animation to finish
        if (otherObjectDisplayed) {
            const lastSign = this.querySelector('#object-information .accordion-item:last-child .sign')
            lastSign.addEventListener('transitionend', () => this._renderObjectInformation());
        } else {
            this._renderObjectInformation();
        }
        // tooltips might have been disabled before
        this.tooltipList.forEach(tooltip => tooltip.enable() );
    }

    get object() {
        return this._object;
    }

    _renderObjectInformation() {
        this.collapseElems = [];
        this.$objectInformationList.innerHTML = '';

        if (this._object) {
            this.$streetLink.href = this._object.permalink;
            let infoItems = this._createInfoArray(this._object);

            infoItems.forEach((info, index) => {
                let $infoItem = this._renderItem(info, index, this._object.className)
                let $infoItemCollapse = $infoItem.querySelector(`#target-${index}`);
                let bsCollapse = new bootstrap.Collapse($infoItemCollapse, {
                    toggle: false,
                    parent: this.$objectInformationList
                });
                this.collapseElems.push(bsCollapse);
            });
            // setTimeout to enable animations
            setTimeout(() => {
                this.$objectInformation.classList.add('visible');
                this.$objectInformation.classList.add('unfolded');
            }, 1);
            this.$objectInformation.addEventListener('transitionend', (e) => {
                // don't fire for child transitions
                if (e.propertyName === 'bottom') {
                    this.showHintOnFirstLoad();
                    this.collapseElems[0]?.show();
                }
            });
        } else {
            this.$objectInformation.classList.remove('visible');
        }
    }

    _createInfoArray(obj) {
        return [
            {
                heading: `<div class="street-heading"><h2>${obj.name}</h2><h3>${obj.quarter}</h3></div>`,
                text: `${obj.longDesc ? obj.longDesc : obj.shortDesc}<p class="text-end">${obj.author}</p>`
            },
            ... obj.currentSituation ? [{
                heading: `<div class="street-heading"><h2>${i18n.currentSituation}</h2></div>`,
                text: `${obj.currentSituation}`,
            }] : [],
            ... obj.recommendation ? [{
                heading: `<div class="street-heading"><h2>${i18n.recommendation}</h2></div>`,
                text: `${obj.recommendation}`,
            }] : [],
        ]
    }

    _renderItem(info, index, className) {
        let $infoItem = document.createElement('div');
        $infoItem.classList.add('accordion-item');
        this.$objectInformationList.appendChild($infoItem);
        $infoItem.innerHTML = `
            <div class="${className} attached">
                <div class="sign-content">
                    <h2 class="accordion-header" id="item-${index}">
                        <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#target-${index}"
                            aria-expanded="false"
                            aria-controls="target-${index}">
                            ${info.heading}
                        </button>
                    </h2>
                    <div
                        id="target-${index}"
                        class="accordion-collapse collapse"
                        aria-labelledby="item-${index}">
                        <div class="accordion-body">${info.text}</div>
                    </div>
                </div>
            </div>
            <div class="handle"><div class="handle-inner">&nbsp;</div></div>
        `;
        return $infoItem;
    }

}

window.customElements.define('object-information', ObjectInformation);
