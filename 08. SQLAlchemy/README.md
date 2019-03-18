# 8 SQL Alchemy - Bootcamp Assignment

## Background

SQL Alchemy was a very difficult topic for me. I could not understand the use for it until recently I was trying to deploy a flask app on Heroku and my inital MySQL connection needed to change to Postgres. Thankfully, all the SQL Alchemy did all the translation for me and all I needed to change was my engine connection.

In this assignemnt, we were analyzing the climate of several weather stations in Hawaii! The analysis was completed using SQLAlchemy ORM queries, Pandas, and Matplotlib.


## Step 1 - Climate Analysis and Exploration

* I had to use SQLAlchemy `create_engine` to connect to a sqlite database.

* I used SQLAlchemy `automap_base()` to reflect SQL tables into classes and save a reference to those classes called `Station` and `Measurement`.

## Step 2 - Precipitation Analysis

* Created a query to retrieve the last 12 months of precipitation data (`date` and `prcp` values), load it into a pandas dataframe (sorted by date) and plot by weather station.

## Step 3 - Station Analysis

* Created query to calculate the total number of weather stations.

* Find the most active station (largest number of observations).

* Query for the last 12 months of temperature observation data (tobs) for the most active station.

* Plot the results on a histogram wiht 12 bins.

## Temperature Analysis

* The function `calc_temps` will accept a start and end date in the format `%Y-%m-%d` and return the minimum, average, and maximum temperatures for that range of dates.

* I used the function `calc_temps` to get the min, max, and average temperatures for a given date range and plotted the average on a bar chart with a y error spanning min to max. 

* The funciton  `daily_normals` will calculate the daily normals for a specific date. This date string will be in the format `%m-%d`. 

* I used the function  `daily_normals` to calculate the daily normals for a given date range and plotted the data on an are plot. 

### Copyright

Coding Boot Camp © 2018. All Rights Reserved.
