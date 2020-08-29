// const { getgroups } = require("process");

// Creating map object
const myMap = L.map("map", {
  center: [34.0522, -118.2437],
  zoom: 3
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
function myStyle(entry) {
  let color;
  let marker_size;
  if (entry.properties.mag > 1000) {
    color = 'red',
    marker_size = entry.properties.mag * 10000
  }

  return color, marker_size;  
}

// Load in GeoJson data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// Grab data with d3
d3.json(url).then(jsonData => {
  console.log(jsonData);
  const features = jsonData.features;
  console.log(features);
  // L.geoJson(jsonData.features.properties.mag).addTo(myMap);
  features.forEach(feature => {
    // console.log(feature);
    // console.log(feature.properties.mag);

    // Add while circles for all locations

// Create a new choropleth layer
const location_sliced = feature.geometry.coordinates.slice(0, 2);
const location = location_sliced.reverse();
console.log(location);
L.circle(location, {
  // Define what  property in the features to use
  valueProperty: 'mag', // which property in the features to use
  scale: ['white', 'pink', 'green', 'blue', 'red'], // chroma.js scale - include as many as you like
  steps: 5, // number of breaks or steps in range
  mode: 'q', // q for quantile, e for equidistant, k for k-means
  style: {
    color: '#fff', // border color
    weight: 2,
    fillOpacity: 0.8
  }
  // , onEachFeature: function(feature, layer) {
  //   layer.bindPopup(`Population Density: ${feature.properties.Pop_Den}`)
  // }
}).addTo(myMap)
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
