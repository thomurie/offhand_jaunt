import os
import json

from flask import Flask, render_template, redirect, session, jsonify, g, request
from models import connect_db, db
from validation import random_choice, data, rapid_api_key
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

@app.route('/validation', methods=["POST"])
def validate_input():
    resp = request.json
    if resp['data']['home'] in data:
        resp['data']['destination']= random_choice(data)
        resp['data']['key']= rapid_api_key
        print(resp["data"])
        return jsonify(resp['data'])

    return render_template('index.html', error = "Invalid Home Airport")