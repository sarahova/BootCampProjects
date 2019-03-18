# 5 APIs - Bootcamp Assignment

## Background

APIs were our first introduction into a data extraction method and our first exposure into why urls come with all those extra characters!

## WeatherPy

I created a python script to visualize the weather of 500+ cities across the world of varying distance from the equator. I used  the python [citipy library](https://pypi.python.org/pypi/citipy) and the [OpenWeatherMap API](https://openweathermap.org/api) to create a series of scatter plots to showcase the following relationships:

* Temperature (F) vs. Latitude
* Humidity (%) vs. Latitude
* Cloudiness (%) vs. Latitude
* Wind Speed (mph) vs. Latitude

The final notebook had to:

* Randomly select **at least** 500 unique (non-repeat) cities based on latitude and longitude.
* Perform a weather check on each of the cities using a series of successive API calls.
* Include a print log of each city as it's being processed with the city number and city name.
* Save both a CSV of all data retrieved and png images for each scatter plot.

### Copyright

Coding Boot Camp © 2018. All Rights Reserved.
