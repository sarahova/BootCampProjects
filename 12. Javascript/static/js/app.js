// from data.js
var tableData = data;

// create unique lists based on data (for drop downs)
var distinctDates=[]
var distinctCities=[]
var distinctStates=[]
var distinctCountries=[]
var distinctShapes=[]

tableData.forEach(function(record){
    if(distinctDates.includes(record.datetime)===false){
        distinctDates.push(record.datetime)
    }
    if(distinctCities.includes(record.city)===false){
        distinctCities.push(record.city)
    }
    if(distinctStates.includes(record.state)===false){
        distinctStates.push(record.state)
    }
    if(distinctCountries.includes(record.country)===false){
        distinctCountries.push(record.country)
    }
    if(distinctShapes.includes(record.shape)===false){
        distinctShapes.push(record.shape)
    }
});

//create drop down options for filter
var selectDate=d3.select('#datedrop')
distinctDates.forEach(function(date){
    selectDate.append('option').html(`<option value=${date}>${date}</option>`)
});

var selectCity=d3.select('#citydrop')
distinctCities.forEach(function(city){
    selectCity.append('option').html(`<option value=${city}>${city}</option>`)
});
var selectState=d3.select('#statedrop')
distinctStates.forEach(function(state){
    selectState.append('option').html(`<option value=${state}>${state}</option>`)
});
var selectCountry=d3.select('#countrydrop')
distinctCountries.forEach(function(country){
    selectCountry.append('option').html(`<option value=${country}>${country}</option>`)
});
var selectShape=d3.select('#shapedrop')
distinctShapes.forEach(function(shape){
    selectShape.append('option').html(`<option value=${shape}>${shape}</option>`)
});

//create variables for table
var myTable=d3.select("table");
var tableBody=myTable.select("tbody");

//fill in whole table upon page load
tableData.forEach(function(record){
    var row=tableBody.append('tr')
    Object.entries(record).forEach(([key,value]) => row.append('td').text(value))
});

//create variable for filter button
var filterButton=d3.select('#filter-btn');

filterButton.on("click", function () {
    //prevent page from refreshing
    d3.event.preventDefault();
    //remove data from rows so that filtered tabel can be rendered
    tableBody.selectAll('tr').remove()
    //remove selection of defaults on dropdowns
    d3.selectAll('.default').attr("selected", null)
    //create variable for date input value
    var inputDate=selectDate.property('value')
    var inputCity=selectCity.property('value')
    var inputState=selectState.property('value')
    var inputCountry=selectCountry.property('value')
    var inputShape=selectShape.property('value')

    //create a query object, only includes serach criteria
    var query={}
    if(inputDate!=='default'){
        query['datetime']=inputDate
    }
    if(inputCity!=='default'){
        query['city']=inputCity
    }
    if(inputState!=='default'){
        query['state']=inputState
    }
    if(inputCountry!=='default'){
        query['country']=inputCountry
    }
    if(inputShape!=='default'){
        query['shape']=inputShape
    }

    //create a function to search based on query object
    function search(record){
        return Object.keys(this).every((key) => record[key] === this[key]);
      };

    //filter tableData based on query
    var filteredData=tableData.filter(search, query);
    
    //create table based on query
    filteredData.forEach(function(record){
        var row=tableBody.append('tr')
        Object.entries(record).forEach(([key,value]) => row.append('td').text(value))
    });
    //reset query object and dropdowns back to defaults
    query={}
    d3.selectAll('.default').attr("selected", "selected")
});

//create variable for reset button
var resetButton=d3.select('#reset-table');

resetButton.on("click", function () {
    //prevent page from refreshing
    d3.event.preventDefault();
    //remove data from rows so that filtered tabel can be rendered
    tableBody.selectAll('tr').remove()
    //remove selection of defaults on dropdowns
    d3.selectAll('.default').attr("selected", null)
    //fill in whole table upon page load
    tableData.forEach(function(record){
        var row=tableBody.append('tr')
        Object.entries(record).forEach(([key,value]) => row.append('td').text(value))
    })
    });