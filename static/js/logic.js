const dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  id: "dark-v10",
  accessToken: API_KEY
});

// Define variables for our tile layers
const light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

function getColor(sig) {
  return sig > 1000 ? 'darkred' :
    sig > 750  ? 'crimson' :
    sig > 500  ? 'salmon' :
    sig > 250  ? 'peachpuff' :
                 'white';
}

// Add layers for different types of natural disaster
const layers = {
  earthquakes: new L.LayerGroup(),
  quarry_blasts: new L.LayerGroup(),
  ice_quakes: new L.LayerGroup(),
  explosions: new L.LayerGroup(),
  chemical_explosions: new L.LayerGroup(),
  other_events: new L.LayerGroup()
}

// Creating map object
const myMap = L.map("map", {
  center: [36.4786667,-117.5141667],
  zoom: 3,
  layers: [
    layers.earthquakes,
    layers.quarry_blasts,
    layers.ice_quakes,
    layers.explosions,
    layers.chemical_explosions,
    layers.other_events
  ]
});

const overlays = {
  "Earthquakes": layers.earthquakes,
  "Quarry Blasts": layers.quarry_blasts,
  "Ice quakes": layers.ice_quakes,
  "Explosions": layers.explosions,
  "Chemical Explosions": layers.chemical_explosions,
  "Other Events": layers.other_events
}

dark.addTo(myMap);

// Only one base layer can be shown at a time
const baseMaps = {
  Light: light,
  Dark: dark
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlays).addTo(myMap);

// Load in GeoJson data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// Grab data with d3
d3.json(url).then(jsonData => {
  const features = jsonData.features;

  // add control for layers
  let featureType;

  // // console.log(features);
  // const earthquakes = features.filter(feature => feature.properties.type === "earthquake");
  // const quarry_blasts = features.filter(feature => feature.properties.type === "quarry blast");
  // const ice_quakes = features.filter(feature => feature.properties.type === "ice quake");
  // const explosions = features.filter(feature => feature.properties.type === "explosion");
  // const chemical_explosions = features.filter(feature => feature.properties.type === "chemical explosion");
  // const other_events = features.filter(feature => feature.properties.type === "other event");

  features.forEach((feature, i) => {  
    let location = (feature.geometry.coordinates.slice(0, 2)).reverse();
    let type = feature.properties.type;
    // console.log(type);
    let place = feature.properties.place;
    let mag = feature.properties.mag;
    let sig = feature.properties.sig;
    let date = new Date(feature.properties.time);
    
    let radius = 0;
      if (mag > 4) {radius = mag * 40000}
      
    // const natural_event = Object.
    // Object.assign({}, type);

    // console.log(type);

    if (type === "earthquake") {featureType = "earthquakes";}
    else if (type === "quarry blast") {featureType = "quarry_blasts";}
    else if (type === "ice quake") {featureType = "ice_quakes";}
    else if (type === "explosion") {featureType = "explosions";}
    else if (type === "chemical explosion") {featureType = "chemical_explosions";}
    else {featureType = "other_events";}
    // console.log(featureType);
    
    const newFeature = L.circle(location, {
      weight: .5,
      color: getColor(sig),
      fillOpacity: 0.7,
      radius: radius
    });

    newFeature.addTo(layers[featureType]);

    // const newFeatureCircle = L.circle(location, {
    //   weight: .5,
    //   color: getColor(sig),
    //   fillOpacity: 0.7,
    //   radius: radius
    // });
    
    newFeature.bindPopup(`<h3>${type}: ${place}</h3><hr>
      <h4>Time: ${date}</h4><hr>
      <h4>Magnitude: ${mag}</h4><hr>
      <h4>Significance: ${sig}</h4>`, {maxWidth: 560}) //
    .addTo(myMap)
  })
})

var legend = L.control({position: "bottomright"});
legend.onAdd = function(myMap) {
  var div = L.DomUtil.create('div', 'legend');
  var labels = ["0-250",  "250-500", "500-750", "750-1000", "1000+"];
  var grades = [250, 251, 501, 751, 1000];
  div.innerHTML = '<div><br>EQ Significance</br><br></div>';
  for(var i = 0; i < grades.length; i++) {
    div.innerHTML += "<i style='background:" + getColor(grades[i])
    + "'>&nbsp;&nbsp;</i>" + labels[i] + '<br/>';
  }
  return div;
}

legend.addTo(myMap);
let slips = [];

const myStyle_over5 = {
  "color": "green",
  "weight": 4,
  "opacity": 1
}
const myStyle_1to5 = {
  "color": "green",
  "weight": 2,
  "opacity": 1
}




const jsonData = "static/data/qfaults_latest_quaternary.geojson";
// Grab data with d3
d3.json(jsonData).then(jsonData => {
  const all_features = jsonData.features;
  const features = all_features.filter( feature => feature.properties.slip_rate !== "Unspecified" && feature.properties.slip_rate !== null);
  const slip_over5 = features.filter(feature => feature.properties.slip_rate === "Greater than 5.0 mm/yr");
  const slip_1to5 = features.filter(feature => feature.properties.slip_rate === "Between 1.0 and 5.0 mm/yr");
  console.log(slip_1to5);

  const faultLayer = L.geoJson(slip_1to5, myStyle_1to5).addTo(myMap)
  faultLayer.onEachFeature  
  function bindpopups(feature, layer) {
    layer.bindPopup(`<h3>Fault: ${feature.properties.fault_name}</h3><hr>
    <h4>Slip Rate: ${feature.properties.slip_rate}</h4>`, {maxWidth: 560}).addTo(myMap)
  };
});


// .bindPopup(`<h3>Fault: ${feature.properties.fault_name}</h3><hr>
//       <h4>Slip Rate: ${feature.properties.slip_rate}</h4>`, {maxWidth: 560})
      