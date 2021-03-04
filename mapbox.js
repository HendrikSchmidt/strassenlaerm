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
        const popupOptions = {
            className: 'streetname',
            maxWidth: '400px',
            offset: 30,
        };
        const popup = new mapboxgl.Popup({...popupOptions, closeButton: false});

        map.on('mouseenter', layer, e => {
            // Change the cursor to a pointer when the mouse is over the places layer.
            map.getCanvas().style.cursor = 'pointer';

            const name = e.features[0].properties.name;
            const html = `<div class="desc"><h2>${name}</h2></div><div class="more"></div>`;

            popup
                .trackPointer()
                .setHTML(html)
                .addTo(map);
        });
        map.on('mouseleave', layer, () => {
            // Change it back to a pointer when it leaves.
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        map.on('click', layer, e => {
            console.log(e.features);
            const features = e.features[0];
            const props = features.properties;
            const html = `<div class="desc"><h2>${props.name}</h2><p>${props.shortDesc}</p></div>`
                       + `<div class="more"><a href="#${features.id}"> > mehr </a></div>`;

            const expPopup = new mapboxgl.Popup(popupOptions)
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);

            setTimeout(() => expPopup.addClassName('expanded'), 1)
        });

    })
});

