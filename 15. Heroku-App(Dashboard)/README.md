# 15 Dashboard App - Bootcamp Project 

## Background

This assignment was to create a dashboard app and deploy it using Flask and Heroku! 

Having worked in manufacturing/operations I wanted to use data that was supplychain oriented (i.e. sales data), and I knew I wanted a lot of data.

I found [Iowa Liquor Sales](https://data.iowa.gov/Economy/Iowa-Liquor-Sales/m3tr-qhgy) that had 15 million rows of liquor sales in Iowa from Jan 2012 to Jan 2019! 

Here is my final app: https://iowa-liquor-sale-summary.herokuapp.com/

### Transformation and Load (ExtractTransformLoad.ipynb)

So I don't have a super computer....So I started with the last 4 months (Oct, Nov, Dec 2018 and Jan 2019), that came to 800,000+ rows. First thing I tried to do was load the data into Heroku's add-on POSTGRES SQL database. And of course...if I want more than 10,000 rows, I need to pay more! 

So....it was obvious that I was going to need to split my development environment and my production environment. So after some minor munging, I loaded the 800,000+ rows into my local MySQL server.

Then I created a connection to my local MYSQL database via SQL Alchemy and did all groupbys and aggregations that a planned to do to shrink the row number. I also had to get rid of the lowest selling liquor categories to get my row number under 10,000. In the end....I had 7759 rows of total volume, total sale, and total bottles sold by month, county and liquor category where the data only included the top 20 liquor categories.

Those 7759 rows were loaded into Heroku's postgres add-on database.

### App Functionality

I created a connection to Postgres SQL add-on on Heroku through my flask app (app.py). 

I created 2 routes for my API layer. Except, the url of each route relies on information that the user passes. 

For the first route (`/api/county_data/<county>`), the user picks a `county` by clicking on a map. That route will then run a query to the Postgres SQL database to get month, category, total bottles sold, total sale, total volume (L), county code, and county name for the county selected on the map. This route was used to populate a dropdown with that the user will use to select a Liquor category. But the dropdown will only have liquor categories pertinent to that county.

The second API route (`/api/county_cat_data/<county>/<category>`) is called after the user selects a liquor category from the dropdown box. The route will then run a query to the Postgres SQL database to get month, category, total bottles sold, total sale, total volume (L), county code, and county name for the county selected on the map and the liquor category selected from the dropdown. The data returned was used to generate a D3 barchart that plotted Month on the x axis and had a clickable y axis where the user could decide whether they wanted to see Total Bottles Sold, Total Sale, or Total Volume (L). 

FYI....I know it is not the prettiest app. I think it is safe to say that CSS is not my strength.


![Dashboard](Images/Dashboard.gif)


### Deployment

During deployment, I learnt a valuable lesson.....start simple when debugging. Do not go down the rabbit hole, instead step away for a bit!

I kept getting this one error on my Heroku log that I could not get rid of: "bash: gunicorn:: command not found". I tried everything...I revised my requirements.txt, created a new repo, etc. And it would still not go away. I decided to sleep on it. After a good nights sleep dreaming about 404s, it hit me the next morning within 2 seconds of looking at the error again. gunicorn is trying to execute a command ":", I immediately went to my Procfile and saw it!

When my proc file should have read "web: gunicorn iowa-liquor-sale-summary.app:app", it was reading "web: gunicorn: iowa-liquor-sale-summary.app:app".

A STUPID COLON (:) WAS MESSING ME UP. 

After the easy fix, the app was up and running! 



### Copyright

Coding Boot Camp © 2018. All Rights Reserved.
