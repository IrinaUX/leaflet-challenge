const dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  id: "dark-v10",
  accessToken: API_KEY
});

// Creating map object
const myMap = L.map("map", {
  center: [36.4786667,-117.5141667],
  zoom: 6
});

dark.addTo(myMap);

function getColor(sig) {
  return sig > 1000 ? 'darkred' :
    sig > 750  ? 'crimson' :
    sig > 500  ? 'salmon' :
    sig > 250  ? 'peachpuff' :
                 'white';
}

// Load in GeoJson data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// Grab data with d3
d3.json(url).then(jsonData => {
  const features = jsonData.features;
  features.forEach(feature => {  
    let location_sliced = feature.geometry.coordinates.slice(0, 2);
    let location = location_sliced.reverse();
    let type = feature.properties.type;
    let place = feature.properties.place;
    let mag = feature.properties.mag;
    let sig = feature.properties.sig;
    let timestamp = feature.properties.time;
    let myDate = new Date(timestamp);
 
    let radius = 0;
      if (mag > 4.2) {radius = mag * 10000}
      // else {radius == 800}

    const newFeature = L.circle(location, {
      weight: .5,
      color: getColor(sig),
      fillOpacity: 0.7,
      radius: radius
    });
    
    newFeature.bindPopup(`<h3>${type}: ${place}</h3><hr>
      <h4>Time: ${myDate}</h4><hr>
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

