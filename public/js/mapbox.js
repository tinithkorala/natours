const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
console.log("foo");
mapboxgl.accessToken = 'pk.eyJ1IjoidGluaXRoc2UiLCJhIjoiY2xpN2ZlMXRmMDIwNzNybzVqZGc4czgzYiJ9.eO7POF17fFUvjv54uM4-PQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/tinithse/cli7iar0n00qt01pg6uqdez8a',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    // Create maker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
    .setLngLat(loc.coordinates)
    .addTo(map);

    // Add popup
    new mapboxgl.Popup({
        offset: 30
    })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

    // Extend map bounds to include current locations
    bounds.extend(loc.coordinates);

});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 200,
        left: 100,
        right: 100
    }
}); 