document.addEventListener("DOMContentLoaded", function() {
  createMap(); // Call the createMap function when the DOM content is loaded
});

function createMap() {
  // Create the 'basemap' tile layer that will be the background of our map.
  let myDefaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create the map object with center and zoom options.
  let myMap = L.map("map", {
    center: [38.01, -95.84], // Coordinates for the center of the map
    zoom: 5
  });

  // Add the 'basemap' tile layer to the map.
  myDefaultMap.addTo(myMap);

  // Make a request that retrieves the earthquake geoJSON data.
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    console.log(data); // Log the data to check if it's coming through correctly

    // This function returns the style data for each of the earthquakes we plot on
    // the map. Pass the magnitude and depth of the earthquake into two separate functions
    // to calculate the color and radius.
    function styleInfo(feature) {
      return {
        radius: getRadius(feature.properties.mag), // Get radius based on magnitude
        fillColor: getColor(feature.geometry.coordinates[2]), // Get color based on depth
        color: "#000000", // Border color for the marker
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      };
    }

    // This function determines the color of the marker based on the depth of the earthquake.
    function getColor(depth) {
      if (depth <= 10) return "#00FF00"; // Green
      if (depth <= 30) return "#FFFF00"; // Yellow
      if (depth <= 50) return "#FFA500"; // Orange
      if (depth <= 70) return "#FF4500"; // Red-orange
      return "#FF0000"; // Dark red
    }

    // This function determines the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
      return magnitude * 4; // Scale the size of the circle markers
    }

    // Add a GeoJSON layer to the map once the file is loaded.
    L.geoJson(data, {
      // Turn each feature into a circleMarker on the map.
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, styleInfo(feature)); // Use the styleInfo function to define the marker's style
      },
      // Set the style for each circleMarker using our styleInfo function.
      style: styleInfo,
      // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`
          <h3>Magnitude: ${feature.properties.mag}</h3>
          <p>Location: ${feature.properties.place}</p>
          <p>Depth: ${feature.geometry.coordinates[2]} km</p>
        `); // Display the earthquake's details in the popup
      }
    }).addTo(myMap); // Add the GeoJSON layer to the map
  });

  // Create a legend control object.
  let legend = L.control({ position: "bottomright" });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    // Initialize depth intervals and colors for the legend
    const depthIntervals = [0, 10, 30, 50, 70];
    const colors = ["#00FF00", "#FFFF00", "#FFA500", "#FF4500", "#FF0000"];
    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let index = 0; index < depthIntervals.length; index++) {
      div.innerHTML +=
        '<i style="background:' + colors[index] + '"></i> ' +
        depthIntervals[index] + (depthIntervals[index + 1] ? "&ndash;" + depthIntervals[index + 1] + " km<br>" : "+ km");
    }
    return div;
  };

  // Finally, add the legend to the map
  legend.addTo(myMap);
}
