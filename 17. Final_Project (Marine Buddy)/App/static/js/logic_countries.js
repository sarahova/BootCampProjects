$( document ).ready(function() {
  console.log( $(".navbar-toggler").on("click", function(){
      $("#navbarNavAltMarkup").toggleClass("show")
    }));
     $("body").append('<a href="#topOfPage"><div id="backToTop"><img src="/static/img/arrows.png"></div></a>');
      var prevScrollpos = window.pageYOffset;
      window.onscroll = function() {
      var currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
          document.getElementById("backToTop").style.right = "-100px";
        } else {
          document.getElementById("backToTop").style.right = "10px";
        }
        prevScrollpos = currentScrollPos;
      }
});

//////////////////////////////////////Prepare Graph/////////////////////////////////


var svgWidth = 950;
var svgHeight = 500;

var margin = {
top: 20,
right: 0,
bottom: 50,
left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//append svg
var svg_group = d3
.select("#chart")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)
.attr('id', 'theSVG')
.classed("chartHide", true)

// Append an SVG group
var chartGroup = svg_group.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`)
.classed("plot", true);


// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
// create scales
 if (chosenYAxis=='count'){
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d[chosenYAxis])])
  .range([height, 0]);
 }
 else if (chosenYAxis=='percent'){
  var yLinearScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0]);
 }
  return yLinearScale};

  // function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis};
  

  $(".container").append(`<div id="modalOutter" class="modalHide"><div id="modalInner"><div class="xButton" onclick="turnOff()"><p class="xP">X</p></div><div><p id="leftarrow" class="btn">< Prev</p><p id="rightarrow" class="btn">Next ></p></div><img src="" id="modalimg"></div></div>`);

function turnOff(){
    $("#modalOutter").toggleClass("modalHide");
}


function picModal(species){
    $("#modalOutter").toggleClass("modalHide");
    //clear old pictures
    $('#modalimg').attr('src', "")


    var url = `/api/get_speciesdetails/${species}`
    d3.json(url).then(function(data) {
      console.log(data.images)
      image_list=data.images
      total_length=image_list.length

      var img_num=0
      console.log("start",img_num)
      $('#modalimg').attr('src', image_list[img_num])

        $('#rightarrow').on('click', function(){
          if (img_num<total_length-1){
            img_num+=1
            $('#modalimg').attr('src', image_list[img_num])
            console.log("right arrow", img_num)
          }
          else{
            img_num=total_length-1
            $('#modalimg').attr('src', image_list[img_num])
            console.log("right arrow", img_num)           
          }
        })
        $('#leftarrow').on('click', function(){
          if (img_num>0){
            img_num-=1
            $('#modalimg').attr('src', image_list[img_num])
            console.log("left arrow", img_num)
          }
          else{
            img_num=0
            $('#modalimg').attr('src', image_list[img_num])
            console.log("left arrow", img_num)
          }
        })
      
    })
}


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
      .attr("x", d => xLinearScale(d.status))
      .attr("width", xLinearScale.bandwidth())
      .attr("y", d => yLinearScale(d[chosenYAxis]))

  return barsGroup};



// function used for updating bars group with new tooltip
function updateToolTip(data, chosenYAxis, barsGroup) {

  if (chosenYAxis === "count") {
    var label = "Total count of species with status: ";
  }
  else if (chosenYAxis === "percent") {
    var label = "Percent of species with status: ";
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


///////////////////////////////////Prepare Map////////////////////////////////////////////////////////////

// Adding tile layer to the map
var light_layer=L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  minZoom: 2,
  id: "mapbox.light",
  accessToken: API_KEY
})

// Adding tile layer to the map
var pirate_layer= L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
minZoom: 2,
id: "mapbox.pirates",
accessToken: API_KEY
});

// Create a baseMaps object
var baseMaps = {
  "Light": light_layer,
  "Pirate": pirate_layer
};

//append map to div with id 'map'
var myMap = L.map("map", {
  center: [0, 0],
  zoom: 2,
  layers:[light_layer]
});

L.control.layers(baseMaps).addTo(myMap);

// adding geojson layer
var prevLayerClicked = null;

L.geoJSON(countries[0], {
  style: function(feature){
      return {
      fillOpacity: 0.3,
      weight: 1.5,
      fillColor: 'blue'
      }
    },
  
  onEachFeature: function(feature, layer) {
    // Set mouse events to change map styling
    layer.on({
      // When a user's mouse touches a county the svg opacity changes to 70% so that it stands out
      mouseover: function(event) {
        layer = event.target;
        layer.setStyle({
          fillOpacity: 0.7
        });
      },
      // When the cursor no longer hovers over the country - when the mouseout event occurs - the svg's opacity reverts back
      mouseout: function(event) {
        layer = event.target;
        layer.setStyle({
          fillOpacity: 0.3
        });
      },
      // When a country is clicked, the country variable value is updated to what is clicked  
      click: function(event) {

        //remove existing cards
        $("#showCards").empty();

        //remove existing svg graph
        chartGroup.selectAll('g').remove()

        //color previous clicked country as blue
        if (prevLayerClicked !== null) {
          prevLayerClicked.setStyle({
            fillColor: 'blue'
          })
        }
        //the current clicked country is colored green
        layer.setStyle({
          fillColor: 'green'
        })
        //populating the clicked layer in prevLayerClicked variable
        prevLayerClicked = layer;

        //populating variable country with country name
        country=event.target.feature.properties.name

        //make api call to get data on country for dropdown
        var url_1 = `/api/get_countryspecies/${country}`
        d3.json(url_1).then(function(data) {
          category_options=data[1]
          chart_data=data[0]

          console.log(category_options)
          console.log(chart_data)

          d3.select('#chartTitle').text(`Conservation Barometer of ${country}`)
          d3.select('#categoryTitle').text(`Which category of marine life native to ${country} would you like to explore?`)
          
          //create dropdown options for each county  
          var selectCategory=d3.select('#category')
          //remove old drop down options
          selectCategory.selectAll('.category-drop').remove()  
          //append options to drop-down based on values in category_options
          category_options[`${country}`].forEach(function(cat){
            selectCategory.append('option').classed("category-drop", true).html(`<option value=${cat}>${cat}</option>`)
          }); 
          
          ///////////////////////////////////////////start graph////////////////////////////////////////////////////////
  
          // Initial Params
          var chosenYAxis= "count"

          //get x-axis Months values
          var statuses = chart_data.map(item => item.status)

          // scale x to chart width
          var xLinearScale = d3.scaleBand()
          .domain(statuses)
          .range([0, width])
          .padding(0.1);

          //scale chosen y to chart width
          var yLinearScale=yScale(chart_data, chosenYAxis)

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
          .data(chart_data)

          barsGroup
          .enter()
          .append("rect")
          .merge(barsGroup)
          .attr("x", d => xLinearScale(d.status))
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
          barsGroup = updateToolTip(chart_data, chosenYAxis, barsGroup);
          
          // append x axis label
          var labelsGroupX = chartGroup.append("g")
          .attr("transform", `translate(${(width / 2) - 16}, ${height + 10})`);

          var statusLabel = labelsGroupX.append("text")
          .attr("x", 0)
          .attr("y", 25)
          .text("Status");

          // Create group for  3 y-axis labels
          var labelsGroupY = chartGroup.append("g").classed('labels', true)
          .attr("transform", `translate(${margin.left}, ${(height / 2)})`);

          var CountLabel = labelsGroupY.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", 0)
          .attr("y", -195)
          .attr("dy", "1em")
          .attr("value", "count") // value to grab for event listener
          .classed("active", true)
          .text("Total count of species in country");

          var PercentLabel = labelsGroupY.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", 0)
          .attr("y", -180) 
          .attr("dy", "1em")
          .attr("value", "percent") // value to grab for event listener
          .classed("inactive", true)
          .text("Percent (%) of species in country");


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
            yLinearScale = yScale(chart_data, chosenYAxis);
          
            // updates y axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);

            // updates bars with new y values
            barsGroup = renderBars(chart_data, barsGroup, yLinearScale, chosenYAxis, xLinearScale) 
            
            // updates tooltips with new info
            barsGroup = updateToolTip(chart_data, chosenYAxis, barsGroup);
            
            // changes classes to change bold text for y axis
            if (chosenYAxis === "count") {
              CountLabel
                .classed("active", true)
                .classed("inactive", false);
              PercentLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "percent") {
              CountLabel
                .classed("active", false)
                .classed("inactive", true);
              PercentLabel
                .classed("active", true)
                .classed("inactive", false);
            }
            }
          })
        });
    d3.select("#theSVG").classed("chartHide", false)
      }
    });
    // Giving each county a pop-up to display county name
    layer.bindPopup("<p>" + `Country: ${feature.properties.name}` + "</p>");
  }
}).addTo(myMap)

function fishLoad(){
  $("body").append('<div class="fishLoad"><img src="/static/img/emperor_fish_swimming_wide.gif"></div>');
}
function fishRemove(){
  setTimeout(function(){ $(".fishLoad").addClass("hideFish"); }, 3000);
}



// create variable for drop down selection
var dropdown=d3.select('#category')
dropdown.on("change", function() {
    //prevent page from refreshing
    d3.event.preventDefault();
    //call loading icon
    fishLoad()
    // create variable for selected value from dropdown
    var category=d3.select('#category').property('value')
    //console log api arguments
    console.log(category)
    console.log(country)

    //make api call with current county and category variables
    var url = `/api/get_countryspecies_bycat/${country}/${category}`
    d3.json(url).then(function(data) {

      /////////////////////////Create Cards on Page//////////////////
        var content = '<div id="theResults">';
        for(i = 0; i < data.length; i++){
            var picture = data[i].images[0];
            var commonName = data[i].common_name;
            var scientificName = data[i].scientific_name;
            var depth = data[i].depth;
            var status = data[i].status;
            var popTrends = data[i].population_trend;
            var webLink = data[i].IUCN_weblink;
                
            if(i%3 == 0 || i == 0){    
                content += '<div class="row">'; // opening row every 3
                } 
               
            // content += '<div class="col-md-4"><div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><img class="thePictures" src="' + picture + '"></div><div class="flip-card-back"><h1>' + commonName +'</h1><p>Scientific Name: ' + scientificName + '</p><p>Depth: ' + depth + '</p><p>Status: ' + status + '</p><p>Poulation Trends: ' + popTrends + '</p><a class="btn cardsBtn" target="_blank" href="' + webLink + '">IUCN Link</a><button value="" class="modalPop cardsBtn btn" onclick="picModal()">More Pictures</button></div></div></div></div>';
            content += `<div class="col-md-4"><div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><img class="thePictures" src="${picture}"></div><div class="flip-card-back"><h1>${commonName}</h1><p>Scientific Name: ${scientificName}</p><p>Depth: ${depth}</p><p>Status: ${status}</p><p>Poulation Trends: ${popTrends}</p><a class="btn cardsBtn" target="_blank" href="${webLink}">IUCN Link</a><button value="" class="modalPop cardsBtn btn" onclick="picModal('${commonName}')">More Pictures</button></div></div></div></div>`;
                  
            if( i%3 == 2 ){
                content += '</div>'; // closing row every 3
            } 
        
            }
            content += '</div>'; //closing container
            $("#showCards").empty();
            $("#showCards").append(content);
            fishRemove()

});

});

