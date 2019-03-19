function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`
  d3.json(url).then(function(metadata) {
    // console.log(metadata)
    
    // Use d3 to select the panel with id of `#sample-metadata`
    var metadata_panel=d3.select("#sample-metadata")
    // Use `.html("") to clear any existing metadata
    metadata_panel.html("")

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(metadata).forEach(([key,value]) => metadata_panel.append('p').append('span').text(`${key} : ${value}`))

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    var level= (metadata.WFREQ+1)*18-9

    // Trig to calc meter point
    var degrees = 180 - level,
    radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
    x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'washing frequency',
    text: level,
    hoverinfo: 'text+name'},
    { values: [50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50],
    direction: "clockwise",
    rotation: 90,
    text: ['0', '1', '2', '3','4','5', '6', '7', '8', '9', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(14, 127, 0, .5)',
                     'rgba(50, 140, 16, .5)',
                     'rgba(110, 154, 22, .5)',
                     'rgba(170, 202, 42, .5)',
                     'rgba(202, 209, 95, .5)',
                     'rgba(210, 206, 145, .5)',
                     'rgba(232, 226, 202, .5)',
                     'rgba(240, 226, 202, .5)',
                     'rgba(245, 226, 202, .5)',
                     'rgba(255, 226, 202, .5)',
                     'rgba(255, 255, 255, 0)']},
    labels: ['0', '1', '2', '3','4','5', '6', '7', '8', '9', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
    }];

    var layout = {
      title: "Belly Button Washing Frequency",
      shapes:[{type: 'path', path: path, fillcolor: '850000', line: {color: '850000'}}],
      xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
      height: 500,
      width: 500
    };

    Plotly.newPlot('gauge', data, layout);
  })
};

function buildCharts(sample) {
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/samples/${sample}`
  d3.json(url).then(function(sampledata) {

    var samplevalues=sampledata.sample_values
    var microbeids=sampledata.otu_ids
    var microbelabels=sampledata.otu_labels

    //rearrange object
    var sampledata_array=[]
    for (i=0; i<samplevalues.length; i++) {
      var row={'microbe_id': microbeids[i], 'value': samplevalues[i], 'microbe_label': microbelabels[i]}
      sampledata_array.push(row)
    }

    //sort object based on highest sample values
    sampledata_array.sort(function(a, b) {
      return parseFloat(b.value) - parseFloat(a.value);
    });
    
    //slice data to get top 10 values
    var sampledata_top10 = sampledata_array.slice(0, 10);
    // console.log(sampledata_top10)
    
    
    //set up pie plot
    var trace1={
      values: sampledata_top10.map(row => row.value),
      labels: sampledata_top10.map(row => row.microbe_id.toString()),
      text:sampledata_top10.map(row => row.microbe_label),
      textinfo: 'percent',
      type: 'pie',
      hoverinfo: 'label + percent + text'     
    };

    var data1=[trace1];

    var layout1 = {
      title: "Top 10 BellyButton Microbes",
      height: 500,
      width: 500
    };
    
    Plotly.newPlot('pie', data1, layout1);
    

    //set up bubble chart
    var trace2={
      x: sampledata_array.map(row => row.microbe_id),
      y: sampledata_array.map(row => row.value),
      text: sampledata_array.map(row => row.microbe_label),
      mode: 'markers',
      marker: {
        size: sampledata_array.map(row => row.value),
        color: sampledata_array.map(row => row.microbe_id)
      },
      hoverinfo: 'text + x + y'
    };

    var data2=[trace2];

    var layout2={
      title: "Sample Values",
      xaxis: {
        title: "otu_id"
      },
      yaxis: {
        title: "sample value"
      },
      height: 600,
      width: 1250
    }
    
    Plotly.newPlot('bubble', data2, layout2);
    });
};
 
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}


function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  }

// Initialize the dashboard
init();
