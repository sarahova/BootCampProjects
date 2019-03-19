// @TODO: YOUR CODE HERE!

var svgWidth = 1000;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis= "obesity"


// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis])*0.9, d3.max(data, d => d[chosenXAxis])*1.1])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis])*0.9, d3.max(data, d => d[chosenYAxis])*1.1])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderCirclesText(circlesText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var labelX = "Poverty: ";
  }
  else if (chosenXAxis==="age"){
    var labelX = "Age: ";
  }
  else if (chosenXAxis==="income"){
    var labelX="Household Income: "
  }
  if (chosenYAxis==="obesity"){
    var labelY="Obesity: "
  }
  else if (chosenYAxis==="smokes"){
    var labelY="Smokes: "
  }
  else if (chosenYAxis==="healthcare"){
    var labelY="Healthcare: "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

    //mouseover event
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv", function(err, Data) {
  if (err) throw err;

  console.log(Data)

  // parse data
  Data.forEach(function(data) {
    data.age = +data.age;
    data.healthcare=+data.healthcare;
    data.income=+data.income;
    data.obesity=+data.obesity;
    data.poverty=+data.poverty;
    data.smokes=+data.smokes
  });

  // xLinearScale and yLinearScale function above csv import
  var xLinearScale = xScale(Data, chosenXAxis);
  var yLinearScale= yScale(Data, chosenYAxis)

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis= chartGroup.append("g")
    // .attr("transform", `translate(0, 0-${height})`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .classed("stateCircle", true);

  // append initial circle labels
  //missing the first states in the list

  var circlesTextGroup= chartGroup.append("g")
 
  var circlesText = circlesTextGroup.selectAll("text")
  .data(Data)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  // .attr("dy", "1em")
  .text(d => d.abbr)
  .classed("stateText", true);



  // Create group for  3 x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var PovertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var AgeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var IncomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");


  // Create group for  3 y-axis labels
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(${margin.left}, ${(height / 2)})`);

  var ObesityLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -170)
    // .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var SmokesLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -150) 
    // .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var HealthcareLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -130)
    // .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");






  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update circle text with new x values
        circlesText = renderCirclesText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        

        // changes classes to change bold text for x axis
        if (chosenXAxis === "poverty") {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });



  // y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(Data, chosenYAxis);
      
        // updates y axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update circle text with new y values
        circlesText = renderCirclesText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        

        // changes classes to change bold text for x axis
        if (chosenYAxis === "obesity") {
          ObesityLabel
            .classed("active", true)
            .classed("inactive", false);
          SmokesLabel
            .classed("active", false)
            .classed("inactive", true);
          HealthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          ObesityLabel
            .classed("active", false)
            .classed("inactive", true);
          SmokesLabel
            .classed("active", true)
            .classed("inactive", false);
          HealthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "healthcare") {
          ObesityLabel
            .classed("active", false)
            .classed("inactive", true);
          SmokesLabel
            .classed("active", false)
            .classed("inactive", true);
          HealthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });


});


//add make responsive to page 