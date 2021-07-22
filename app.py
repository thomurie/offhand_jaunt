# standard libraries
import os
import json

# third party libraries
from flask import Flask, render_template, redirect, session, jsonify, g, request
import requests

# local imports
from models import connect_db, db
from validation import random_choice, data, RAPID_KEY, UNSPLASH_KEY, DATABASE_URL, FLASK_KEY


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = FLASK_KEY

connect_db(app)

@app.route('/', methods=["GET"])
def landing_page():
    return render_template('index.html')
    
@app.route('/flight', methods=["POST"])
def get_flight():
    resp = request.json
    resp['data']['destination']= random_choice(data)
    if resp['data']['home'] in data:
        flight_data = requests.get(f"https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/{resp['data']['home']}-sky/{resp['data']['destination']}-sky/{resp['data']['start']}",
        params = { 'inboundpartialdate': resp['data']['end'] },
        headers = {
      "x-rapidapi-key": RAPID_KEY,
      "x-rapidapi-host":
        "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        })

        return flight_data.json();
    
    return jsonify(error = "Invalid Home Airport")

@app.route('/image', methods = ["POST"])
def get_destination_image():
    resp = request.json
    image_data = requests.get(f"https://api.unsplash.com/search/photos", 
    params = { 'client_id' : UNSPLASH_KEY, 'query': resp['data'], "orientation" : 'landscape'})

    return image_data.json()

@app.route('/privacyPolicy')
def show_privacy_policy():
    return render_template("privacy_policy.html")

# TODO: CREATE 404 page