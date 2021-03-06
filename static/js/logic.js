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
  other_events: new L.LayerGroup(),
  faults: new L.LayerGroup()
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
    layers.other_events,
    layers.faults
  ]
});

const overlays = {
  "Earthquakes": layers.earthquakes,
  "Quarry Blasts": layers.quarry_blasts,
  "Ice quakes": layers.ice_quakes,
  "Explosions": layers.explosions,
  "Chemical Explosions": layers.chemical_explosions,
  "Other Events": layers.other_events,
  "Faults": layers.faults
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

// PART I - Different types of natural disasters
// Load in GeoJson data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// Grab data with d3
d3.json(url).then(jsonData => {
  const features = jsonData.features;

  // add control for layers
  let featureType;

  features.forEach((feature, i) => {  
    let location = (feature.geometry.coordinates.slice(0, 2)).reverse();
    let type = feature.properties.type;
    let place = feature.properties.place;
    let mag = feature.properties.mag;
    let sig = feature.properties.sig;
    let date = new Date(feature.properties.time);
   
    // Increase the radius of earthquakes with magnitude over 4 
    let radius = 0;
      if (mag > 4) {radius = mag * 30000}
    
    // assign feature type
    if (type === "earthquake") {featureType = "earthquakes";}
    else if (type === "quarry blast") {featureType = "quarry_blasts";}
    else if (type === "ice quake") {featureType = "ice_quakes";}
    else if (type === "explosion") {featureType = "explosions";}
    else if (type === "chemical explosion") {featureType = "chemical_explosions";}
    else {featureType = "other_events";}
    // console.log(featureType);
    
    // draw the data with custom colors and proportional circle radius
    const newFeature = L.circle(location, {
      weight: .5,
      color: getColor(sig),
      fillOpacity: 0.7,
      radius: radius
    });

    // Add features to the layers according to their types
    newFeature.addTo(layers[featureType]);
    newFeature.bindPopup(`<h3>${type}: ${place}</h3><hr>
      <h4>Time: ${date}</h4><hr>
      <h4>Magnitude: ${mag}</h4><hr>
      <h4>Significance: ${sig}</h4>`, {maxWidth: 560}) //
    .addTo(myMap)
  })
})

// Create a legend in the bottom right corner for color pallet of EQ significances
var legend = L.control({position: "bottomright"});
legend.onAdd = function(myMap) {
  var div = L.DomUtil.create('div', 'legend');
  var labels = ["0-250",  "250-500", "500-750", "750-1000", "1000+"];
  var grades = [250, 251, 501, 751, 1000];
  div.innerHTML = '<div class="legend-title">EQ Significance</br><hr></div>';
  for(var i = 0; i < grades.length; i++) {
    div.innerHTML += "<i style='background:" + getColor(grades[i])
    + "'>&nbsp;&nbsp;</i>" + labels[i] + '<br/>';
  }
  return div;
}

// Add legend to map
legend.addTo(myMap);

// PART II - second data set with faults data seems to only contain US data

// function to change color of the fault based on the slip rate
function getStyle(slip_rate){
  let weight;
  switch(slip_rate){
      case "Greater than 5.0 mm/yr":
        weight = 4;
        color = 'red';
        break;
      case "Between 1.0 and 5.0 mm/yr":
        weight = 2;
        color = 'salmon';
  }
  return {
      "weight": weight,
      "color": color
  };
}

// Define the json data source
const jsonData = "static/data/qfaults_latest_quaternary.geojson";
// Grab data with d3
d3.json(jsonData).then(jsonData => {
  const all_features = jsonData.features;
  const features = all_features.filter( feature => feature.properties.slip_rate !== "Unspecified" && feature.properties.slip_rate !== null);
  const selected_slip_rates = features.filter(feature => feature.properties.slip_rate === "Greater than 5.0 mm/yr" 
      || feature.properties.slip_rate === "Between 1.0 and 5.0 mm/yr");
  
  // Assign feature type for the layer control
  featureType = "faults";
  L.geoJson(selected_slip_rates, {
    // Define what  property in the features to use
    valueProperty: 'slip_rate', // which property in the features to use
    style: function(feature) 
    {
      return getStyle(feature.properties.slip_rate);
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3>Fault: ${feature.properties.fault_name}</h3><hr>
        <h4>Slip Rate${feature.properties.slip_rate}</h4>`)
    }
  }).addTo(layers[featureType]); // add the layer
 });

      