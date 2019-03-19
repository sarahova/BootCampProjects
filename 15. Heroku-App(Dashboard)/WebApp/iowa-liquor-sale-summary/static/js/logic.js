//////////////////////////////////////Prepare Graph/////////////////////////////////
var svgWidth = 550;
var svgHeight = 500;

var margin = {
top: 20,
right: 0,
bottom: 50,
left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
.select("#chart")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`)
.classed("plot", true);


// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
// create scales
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d[chosenYAxis])])
  .range([height, 0]);

  return yLinearScale};

  // function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis};
  

  // function used for updating bars group with a transition to new bars
function renderBars(data, barsGroup, yLinearScale, chosenYAxis, xLinearScale) {

  // append initial rect
  var barsGroup = chartGroup.selectAll("rect")
  .data(data)

  //enter
  barsGroup.enter()
  .append("rect")

  //exit
  barsGroup
  .exit()
  .transition()
  .delay(100)
  .duration(300)
  .remove();

  //update
  barsGroup
  .transition()
    .duration(300)
    // .ease('bounce')
      .attr("height", d => height - yLinearScale(d[chosenYAxis]))
      .attr("x", d => xLinearScale(d.month))
      .attr("width", xLinearScale.bandwidth())
      .attr("y", d => yLinearScale(d[chosenYAxis]))

  return barsGroup};



// function used for updating bars group with new tooltip
function updateToolTip(data, chosenYAxis, barsGroup) {

  if (chosenYAxis === "total_bottle_sold") {
    var label = "Total Bottles Sold: ";
  }
  else if (chosenYAxis === "total_volume_l") {
    var label = "Total Liters Sold: ";
  }
  else if (chosenYAxis === "total_sale") {
    var label = "Sale Dollars: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) {
      return (`${label} ${d[chosenYAxis]}`);
    });

  barsGroup.call(toolTip);

  barsGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
    d3.select(this)
      .attr("fill", "#57BEF0");

  })
    // onmouseout event
  barsGroup.on("mouseout", function(data, index) {
    toolTip.hide(data, this);
    d3.select(this)
      .attr("fill", "#9DD8F5");
  });

  return barsGroup};
  
/////////////////////////////////Prepare Map////////////////////////////////////////////////////////////

//creating a map object
var myMap = L.map("map", {
  center: [41.878002, -93.097702],
  zoom: 5
});

//adding bounds to map object
var corner1 = L.latLng(43.764748, -90.692946),
corner2 = L.latLng(40.306343, -96.183655),
bounds = L.latLngBounds(corner1, corner2);
// console.log(bounds)


// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  minZoom: 6,
  id: "mapbox.light",
  accessToken: API_KEY
}).addTo(myMap);

//fixing map to bounds
myMap.fitBounds(bounds);
myMap.setMaxBounds(myMap.getBounds());

// adding geojson layer
L.geoJSON(iowacounties[0], {

  style: function(feature){
    return {
    fillOpacity: 0.5,
    weight: 1.5
    }
  },

  onEachFeature: function(feature, layer) {
    // Set mouse events to change map styling
    layer.on({
      // When a user's mouse touches a county the svg opacity changes to 90% so that it stands out
      mouseover: function(event) {
        layer = event.target;
        layer.setStyle({
          fillOpacity: 0.9
        });
      },
      // When the cursor no longer hovers over the county - when the mouseout event occurs - the svg's opacity reverts back to 50%
      mouseout: function(event) {
        layer = event.target;
        layer.setStyle({
          fillOpacity: 0.5
        });
      },
      // When a county is clicked, the county variable value is updated to what is clicked  
      click: function(event) {
        county=event.target.feature.properties.name

        //remove existing graph
        chartGroup.selectAll('g').remove()
        chartGroup.selectAll('rect').remove()

        //make api call to get data on county
        var url = `/api/county_data/${county}`
        d3.json(url).then(function(data) {
          
          //create array of distinct liquor categories for county
          category_options=[]
          data.forEach(function(record){
            if(category_options.includes(record.category)===false){
                category_options.push(record.category)
            }});

          //create dropdown options for each county  
          var selectCategory=d3.select('#category')
          //remove old drop down options
          selectCategory.selectAll('.category-drop').remove()  
          //append options to drop-down based on values in category_options
          category_options.forEach(function(cat){
            selectCategory.append('option').classed("category-drop", true).html(`<option value=${cat}>${cat}</option>`)
          });                   
        })
      }
    });
    // Giving each county a pop-up to display county name
    layer.bindPopup("<p>" + `County: ${feature.properties.name}` + "</p>");
  }
}).addTo(myMap)

/////////////////////////////////Populate Graph//////////////////////////////////////////////////////////////

//create variable for drop down selection
var dropdown=d3.select('#category')
dropdown.on("change", function() {
  //prevent page from refreshing
  d3.event.preventDefault();
  // create variable for selected value from dropdown
  var category=d3.select('#category').property('value')
  //console log api arguments
  console.log(category)
  console.log(county)

  //remove existing svg graph
  chartGroup.selectAll('g').remove()

  //make api call with current county and category variables
  var url = `/api/county_cat_data/${county}/${category}`
    d3.json(url).then(function(data) {
      console.log(data)
      
      // Initial Params
      var chosenYAxis= "total_bottle_sold"

      //get x-axis Months values
      var months = data.map(item => item.month)

        // scale x to chart width
        var xLinearScale = d3.scaleBand()
        .domain(months)
        .range([0, width])
        .padding(0.1);

        //scale chosen y to chart width
        var yLinearScale=yScale(data, chosenYAxis)

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale); 

        // append x axis
        var xAxis = chartGroup.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(bottomAxis);

        // append y axis
        var yAxis= chartGroup.append("g")
          .call(leftAxis);

        // append initial rect
        var barsGroup = chartGroup.selectAll("rect")
        .data(data)

        barsGroup
        .enter()
        .append("rect")
        .merge(barsGroup)
        .attr("x", d => xLinearScale(d.month))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("width", xLinearScale.bandwidth())
        .attr("height", d => height - yLinearScale(d[chosenYAxis]))
        .attr("fill", "#9DD8F5")

        barsGroup
        .exit()
        .transition()
        .delay(100)
        .duration(300)
        .remove();

        // apply initial tool tips
        var barsGroup=chartGroup.selectAll("rect")
        barsGroup = updateToolTip(data, chosenYAxis, barsGroup);
        
        // append x axis label
        var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${(width / 2) - 16}, ${height + 10})`);

        var monthLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .text("Month");

        // Create group for  3 y-axis labels
        var labelsGroupY = chartGroup.append("g").classed('labels', true)
        .attr("transform", `translate(${margin.left}, ${(height / 2)})`);

        var BottlesSoldLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -195)
        .attr("dy", "1em")
        .attr("value", "total_bottle_sold") // value to grab for event listener
        .classed("active", true)
        .text("Total Bottles Sold");

        var SalesLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -180) 
        .attr("dy", "1em")
        .attr("value", "total_sale") // value to grab for event listener
        .classed("inactive", true)
        .text("Total Sale (USD)");

        var VolumeLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -165)
        .attr("dy", "1em")
        .attr("value", "total_volume_l") // value to grab for event listener
        .classed("inactive", true)
        .text("Total Volume Sold (L)");
         

         // y axis labels event listener
         labelsGroupY.selectAll('text')
          .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            console.log(value)
            if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // updates y scale with new data
            yLinearScale = yScale(data, chosenYAxis);
          
            // updates y axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);

            // updates bars with new y values
            barsGroup = renderBars(data, barsGroup, yLinearScale, chosenYAxis, xLinearScale) 
            
            // updates tooltips with new info
            barsGroup = updateToolTip(data, chosenYAxis, barsGroup);
            
            // changes classes to change bold text for y axis
            if (chosenYAxis === "total_bottle_sold") {
              BottlesSoldLabel
                .classed("active", true)
                .classed("inactive", false);
              SalesLabel
                .classed("active", false)
                .classed("inactive", true);
              VolumeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "total_sale") {
              BottlesSoldLabel
                .classed("active", false)
                .classed("inactive", true);
              SalesLabel
                .classed("active", true)
                .classed("inactive", false);
              VolumeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "total_volume_l") {
              BottlesSoldLabel
                .classed("active", false)
                .classed("inactive", true);
              SalesLabel
                .classed("active", false)
                .classed("inactive", true);
              VolumeLabel
                .classed("active", true)
                .classed("inactive", false);
              }
            }
          })
          });
});