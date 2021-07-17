import os
import requests

from flask import Flask, render_template, redirect, session, jsonify, g, request
from models import connect_db, db
from validation import random_choice, data, rapid_api_key, unsplash_key
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgres:///offhand_jaunt'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "it's a secret")

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
      "x-rapidapi-key": rapid_api_key,
      "x-rapidapi-host":
        "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        })

        return flight_data.json();
    
    return jsonify(error = "Invalid Home Airport")

@app.route('/image', methods = ["POST"])
def get_destination_image():
    resp = request.json
    image_data = requests.get(f"https://api.unsplash.com/search/photos", 
    params = { 'client_id' : unsplash_key, 'query': resp['data'], "orientation" : 'landscape'})

    return image_data.json()

# TODO: CREATE 404 page