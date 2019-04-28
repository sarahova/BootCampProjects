import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, render_template, url_for, json, jsonify
from flask_sqlalchemy import SQLAlchemy

import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb

import pandas as pd
import numpy as np

app = Flask(__name__)

#connection to My_SQL
# engine = create_engine('mysql://root:snowboarding@localhost/marinebuddy')
engine = create_engine('mysql://root:root@localhost/marinebuddy', pool_pre_ping=True)


# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
categories = Base.classes.categories
country_occurence=Base.classes.country_occurence
species=Base.classes.species
details=Base.classes.details
images=Base.classes.images
measures=Base.classes.measures
trends=Base.classes.trends
threats=Base.classes.threats

# Create our session (link) from Python to the DB
session = Session(engine)

# function to create dictionary with all details on species

def get_data_speciesdetails(selected_species):

    sel=[details.IUCN_weblink,
        details.depth,
        details.distribution,
        details.family,
        details.genus,
        details.order,
        details.phylum,
        details.population_trend,
        details.url,
        details.status,
        species.common_name, 
        species.scientific_name, 
        categories.category]

    results = session.query(*sel).\
            join(species, details.species_id==species.species_id).\
            join(categories, details.category_id==categories.category_id).\
            filter(species.common_name == selected_species).all() 

    sel2=[trends.year,
        trends.status]

    results_2=session.query(*sel2).\
            join(species, trends.species_id==species.species_id).\
            filter(species.common_name==selected_species).all()

    sel3=[images.images]

    results_3=session.query(*sel3).\
            join(species, species.species_id==images.species_id).\
            filter(species.common_name==selected_species).all()

    sel4=[threats.threats]

    results_4=session.query(*sel4).\
            join(species, species.species_id==threats.species_id).\
            filter(species.common_name==selected_species).all()

    for item in results:
        common_name=item[10]
        scientific_name=item[11]
        category=item[12]
        IUCN_weblink=item[0]
        depth=item[1]
        distribution=item[2]
        family=item[3]
        genus=item[4]
        order=item[5]
        phylum=item[6]
        population_trend=item[7]
        url=item[8]
        status=item[9]

    historic_trend=dict(results_2)
    images_dict=[i[0] for i in results_3]
    threats_dict=[i[0] for i in results_4]

    data_all={'common_name': common_name,
                'scientific_name': scientific_name,
                'category': category,
                'IUCN_weblink': IUCN_weblink,
                'depth': depth,
                'distribution': distribution,
                'family': family,
                'genus': genus,
                'order': order,
                'phylum': phylum,
                'population_trend': population_trend,
                'url': url,
                'status': status,
                'historic_trend': historic_trend,
                'images': images_dict,
                'threats_dict': threats_dict}
    return data_all

##################################################################
###################### Routes ###################################
#################################################################

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/marine-life")
def marine_life():
    return render_template("marine-life.html")

@app.route("/countries")
def countries():
    return render_template("countries.html")

################################################################
############### Get all categories and statuses by country ######################
#################################################################
@app.route('/api/get_countryspecies/<country>', methods=['GET'])
def get_data_countryspecies(country):

    sel1=[country_occurence.countries,
            details.status,
            func.count(details.status)]

    results1 = session.query(*sel1).\
            join(species, species.species_id==country_occurence.species_id).\
            join(details, details.species_id==species.species_id).\
            filter(country_occurence.countries == country).\
            group_by(details.status).all()

    sel2=[country_occurence.countries, 
            categories.category]

    results2 = session.query(*sel2).\
            join(categories, categories.category_id==country_occurence.category_id).\
            filter(country_occurence.countries == country).distinct()

    total=0
    for item in results1:
        total+=item[2]

    data_1=[]
    data_2={}
    data_all=[]
    for item in results1:
        data = {}
        data['country']=item[0]
        data['status']=item[1]
        data['count']=item[2]
        data['percent']=round((item[2]/total*100),2)
        data_1.append(data)
    
    category_options=[]
    for item in results2:
        category_options.append(item[1])


    data_2[f'{country}']=category_options

    data_all=[data_1, data_2]

    return jsonify(data_all)



################################################################
######### Get all species details by country and category #################
#################################################################

@app.route('/api/get_countryspecies_bycat/<country>/<category>', methods=['GET'])
def get_data_countryspecies_bycat(country, category):
    sel=[country_occurence.countries,
            species.common_name, 
            species.scientific_name, 
            categories.category]

    results = session.query(*sel).\
            join(species, species.species_id==country_occurence.species_id).\
            join(categories, categories.category_id==country_occurence.category_id).\
            filter(country_occurence.countries == country).\
            filter(categories.category==category).all()

    species_list=[i[1] for i in results]

    df_list=[]
    for item in species_list:
        species_result=get_data_speciesdetails(item)
        df_list.append(species_result)

    return jsonify(df_list)


################################################################
######### Get all countries by species #########################
#################################################################

@app.route('/api/get_speciescountries/<selected_species>', methods=['GET'])
def get_data_speciescountries(selected_species):

    sel=[species.common_name, 
        species.scientific_name, 
        categories.category,
        country_occurence.countries]

    results = session.query(*sel).\
            join(categories, categories.category_id==species.category_id).\
            join(country_occurence, species.species_id==country_occurence.species_id).\
            filter(species.common_name == selected_species).all() 

    common_name=results[0][0]
    scientific_name=results[0][1]
    category=results[0][2]
    countries_list=[]

    for item in results:
        countries_list.append(item[3])

    data_all={}
    data_all[f"{common_name}"]= {'scientific_name': scientific_name,
                                'catgory': category,
                                'countries': countries_list}

    return jsonify(data_all)

################################################################
######### Get all categories #########################
#################################################################

@app.route('/api/get_categories', methods=['GET'])
def get_categories():

    results = session.query(categories.category).all()
    data=[i[0] for i in results]

    return jsonify(data)

###############################################################
######### Get all details by species #########################
#################################################################

@app.route('/api/get_speciesdetails/<selected_species>', methods=['GET'])
def get_details (selected_species):
    species_details=get_data_speciesdetails(selected_species)
    return jsonify(species_details)

################################################################
######### Get all details for species and status data by category #########################
#################################################################

@app.route('/api/get_speciesdetails_bycat/<selected_category>', methods=['GET'])
def get_data_speciesdetails_bycat(selected_category):

    sel1=[categories.category,
            details.status,
            func.count(details.status)]

    results1 = session.query(*sel1).\
            join(species, species.category_id==categories.category_id).\
            join(details, details.species_id==species.species_id).\
            filter(categories.category == selected_category).\
            group_by(details.status).all()

    sel2=[species.common_name, categories.category]


    results2 = session.query(*sel2).\
            join(categories, categories.category_id==species.category_id).\
            filter(categories.category == selected_category).all() 

    species_list=[i[0] for i in results2]

    total=0
    for item in results1:
        total+=item[2]

    df_1=[]
    df_2=[]
    data_all=[]
    for item in results1:
        data = {}
        data['country']=item[0]
        data['status']=item[1]
        data['count']=item[2]
        data['percent']=round((item[2]/total*100),2)
        df_1.append(data)

    for item in species_list:
        species_result=get_data_speciesdetails(item)
        df_2.append(species_result)

    data_all=[df_1, df_2]
    
    return jsonify(data_all)







if __name__ == '__main__':
    app.run(debug=True)
