import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, render_template, url_for, json, jsonify
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)


#################################################
# Database Setup
#################################################

# engine = create_engine('postgresql://postgres:root@localhost:5432/IowaAlcohol')
engine=create_engine('postgres://imguojbpzabmit:48f1b95385566f8b4e57d227ed344a2644ae16ef78f8a72a4b96e9fddcb26ab7@ec2-54-243-128-95.compute-1.amazonaws.com:5432/d73fss4tvu5upc')


# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
summary = Base.classes.summary

# Create our session (link) from Python to the DB
session = Session(engine)


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route('/api/county_data/<county>', methods=['GET'])
def get_data_county(county):

    sel=[summary.month,
        summary.category, 
        summary.total_bottle_sold, 
        summary.total_sale, 
        summary.total_volume_l, 
        summary.county_code, 
        summary.county_name]

    results = session.query(*sel).filter(summary.county_name == county).all()

    data_all=[]
  
    for item in results:
        data = {}
        data['month'] = item[0]
        data['category']=item[1]
        data['total_bottle_sold']=int(item[2])
        data['total_sale']=float(item[3])
        data['total_volume_l']=float(item[4])
        data['county_code']=float(item[5])
        data['county_name']=item[6]
        data_all.append(data)
    return jsonify(data_all)

@app.route('/api/county_cat_data/<county>/<category>', methods=['GET'])
def get_data_countycat(county, category):

    sel=[summary.month,
        summary.category, 
        summary.total_bottle_sold, 
        summary.total_sale, 
        summary.total_volume_l, 
        summary.county_code, 
        summary.county_name]

    results = session.query(*sel).filter(summary.county_name == county).filter(summary.category == category).all()

    data_all=[]
  
    for item in results:
        data = {}
        data['month'] = item[0]
        data['category']=item[1]
        data['total_bottle_sold']=int(item[2])
        data['total_sale']=float(item[3])
        data['total_volume_l']=float(item[4])
        data['county_code']=float(item[5])
        data['county_name']=item[6]
        data_all.append(data)
    return jsonify(data_all)

if __name__ == '__main__':
    app.run(debug=True)
