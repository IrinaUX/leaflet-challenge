// const { getgroups } = require("process");

// Creating map object
const myMap = L.map("map", {
  center: [34.0522, -118.2437],
  zoom: 5
});

// // Adding tile layer
// L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//   attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//   tileSize: 512,
//   maxZoom: 18,
//   zoomOffset: -1,
//   id: "mapbox/streets-v11",
//   accessToken: API_KEY
// }).addTo(myMap);
// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// Add function for circle marker size and color
// function myStyle(entry) {
//   let color;
//   let marker_size;
//   if (entry.properties.mag < 3) {
//     color = 'red',
//     marker_size = entry.properties.mag * 1000
//   }
//   return color; //, marker_size;  
// }

// Load in GeoJson data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// Grab data with d3
d3.json(url).then(jsonData => {
  // console.log(jsonData);
  const features = jsonData.features;
  console.log(features);
  max_mag = 0;
  features.forEach(feature => {  
    // console.log(feature.properties.mag);
    if (feature.properties.mag > max_mag) {max_mag = feature.properties.mag}
    const location_sliced = feature.geometry.coordinates.slice(0, 2);
    const location = location_sliced.reverse();
    const mag = feature.properties.mag;
    const sig = feature.properties.sig;

    let color = "";
    if (feature.properties.sig > 1000) {color = "darkred"}
    else if (feature.properties.sig > 750) {color = 'firebrick'}
    else if (feature.properties.sig > 500) {color = 'lightcoral'}
    else if (feature.properties.sig > 250) {color = 'lightsalmon'}
    else {color = 'white'}

    let radius;
    if (feature.properties.mag > 2) {radius = feature.properties.mag * 20000}
    else {radius = 200}

    L.circle(location, {
      weight: 0,
      fillColor: color,
      radius: radius
      // radius: mag * 15000,
    })
    .bindPopup("<h2>Earthquake: " + feature.properties.place + "</h2><hr><h3>Time: " + 
        feature.properties.time + "</h3><hr><h3>Magnitude: " + 
        feature.properties.mag + "</h3><hr><h3>Significance: "+ 
        feature.properties.sig + "</h3>")
    .addTo(myMap)
    console.log(max_mag);
  })
})



// Ad light and dark layouts
// Define variables for our tile layers
const light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  // maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

const dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  // maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

// Only one base layer can be shown at a time
const baseMaps = {
  Light: light,
  Dark: dark
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps).addTo(myMap);
