url='https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

//function for earthquake circle colors on map and legend
function getColor(d) {
  return d > 5 ? "#F63F1E" :
         d > 4 ? "#ED9A31" :
         d > 3 ? "#EDBC42" :
         d > 2 ? "#F0D74C" :
         d > 1 ? "#DCF464" :
         d > 0 ? "#9DF057" :
                  "#4DF303";
}

// Create layer groups for earthquakes and faultlines
var earthquake_layer = new L.layerGroup();
var faultlines_layer = new L.layerGroup();

//make API call to gather earthquake data
d3.json(url).then(function(data) {
  var earthquakes=data.features
  console.log(earthquakes)
  
  // Loop through the earthquake data and create one circle marker for each earthquake
  for (var i = 0; i < earthquakes.length; i++) {
    var magnitude=earthquakes[i].properties.mag
    var color = getColor(magnitude)

    //get lat and long
    var lat=earthquakes[i].geometry.coordinates[1]
    var long=earthquakes[i].geometry.coordinates[0]

    // Add circles to earthquake_layer
    L.circle([lat,long], {
      fillOpacity: 0.75,
      color: color,
      fillColor: color,
      // Adjust radius based on magnitude (for some reason it is also dependent on longitude)
      radius: earthquakes[i].properties.mag * 20000
    })
    .bindPopup("<h3>" + earthquakes[i].properties.title + "</h3> <hr> <h3>Type: " + earthquakes[i].properties.type + "</h3>")
    .addTo(earthquake_layer);
  }
});

//add geojson of tectonic plate boundaries to faultlines_layer
L.geoJSON(boundaries[0], {style: {'color': '#F39403'}}).addTo(faultlines_layer);

// Define variables for our base layers
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

// Create a baseMaps object
var baseMaps = {
  "Satellite": satellite,
  "Grayscale": grayscale,
  "Outdoor": outdoor
};

// Create an overlay object
var overlayMaps = {
  "Earthquakes": earthquake_layer,
  "Fault lines": faultlines_layer
};

// Define a map object
var myMap = L.map("map", {
  center: [50.825379, -27.600631],
  zoom: 3,
  layers: [grayscale, 
          earthquake_layer, 
          faultlines_layer
          ]
});

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


// Create the background box for the legend
var legendBox = L.control();

// Create a div with a class "info"
legendBox.onAdd = function (map) {
    return L.DomUtil.create('div', 'info');
};

// Add the box to the map
legendBox.addTo(myMap);


// Create a legend in layer control and position it
var legend = L.control({ position: "bottomright" });

// Create the legend div and update the innerHTML
legend.onAdd = function (map) {

  // Create a div with a class "legend"
  var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5]

  // add title for legend
  div.innerHTML='<p>Magnitude</p>'

  // Loop through our magnitude intervals and generate a label with a colored square for each interval
  for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(magnitudes[i]) + '"></i> ' + 
          + magnitudes[i] + 
          (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
  }
  return div;
};

// Add the legend to the map
legend.addTo(myMap);
