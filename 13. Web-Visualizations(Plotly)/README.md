# 13 Web Visualization Plotly - Bootcamp Assignment 

## Background

In this assignment, I had to build an interactive dashboard to explore the [Belly Button Biodiversity DataSet](http://robdunnlab.com/projects/belly-button-biodiversity/).

### Step 1 - Plotly.js

Use Plotly.js to build interactive charts for your dashboard.

* Create a PIE chart that uses data from the route (`/samples/<sample>`) to display the top 10 samples.

  * Use `sample_values` as the values for the PIE chart

  * Use `otu_ids` as the labels for the pie chart

  * Use `otu_labels` as the hovertext for the chart

  ![PIE Chart](Images/pie_chart.png)

* Create a Bubble Chart that uses data from the route (`/samples/<sample>`) to display each sample.

  * Use `otu_ids` for the x values

  * Use `sample_values` for the y values

  * Use `sample_values` for the marker size

  * Use `otu_ids` for the marker colors

  * Use `otu_labels` for the text values

  ![Bubble Chart](Images/bubble_chart.png)

* Display the sample metadata from the route `/metadata/<sample>`

  * Display each key/value pair from the metadata JSON object somewhere on the page

* Create a Gauge plot (a donut pie chart with half not filled out) to the washing frequency of a sample from 0-9.

![Weekly Washing Frequency Gauge](Images/gauge.png)


* Update all of the plots any time that a new sample is selected.



### Copyright

Coding Boot Camp © 2018. All Rights Reserved.
