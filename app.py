# standard libraries
import os
import json

# third party libraries
from flask import Flask, render_template, redirect, session, jsonify, g, request, url_for, flash
import requests
from flask_cors import CORS
import requests_oauthlib
from requests_oauthlib.compliance_fixes import facebook_compliance_fix

# local imports
from models import connect_db, db, User, Viewed
from validation import random_choice, data, RAPID_KEY, UNSPLASH_KEY, DATABASE_URL, FLASK_KEY, FB_KEY, FB_ID

FB_AUTHORIZATION_BASE_URL = "https://www.facebook.com/dialog/oauth"
FB_TOKEN_URL = "https://graph.facebook.com/oauth/access_token"
FB_SCOPE = ["email"]

URL = "https://127.0.0.1:5000"

CURR_USER_KEY = "None"

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = FLASK_KEY

connect_db(app)
db.create_all()

@app.before_request
def add_user_to_g():
    """If we're logged in, add curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])
        print('1111111')
        print(g.user.viewed)

    else:
        g.user = None

@app.route('/', methods=["GET"])
def index():
    return redirect("/home")

@app.route('/home', methods=["GET"])
def home():
    return render_template('index.html', user = g.user)
    
@app.route('/flight', methods=["POST"])
def get_flight():
    resp = request.json
    destination = random_choice(data)

    if g.user:
        viewed = [l.iata for l in g.user.viewed]
        print('22222222222')
        print(viewed)
        while destination in viewed:
            destination = random_choice(data)
        add_dest = Viewed(user = g.user.email, location = destination)
        db.session.add(add_dest)
        db.session.commit()

    resp['data']['destination']= destination

    if resp['data']['home'] in data:
        flight_data = requests.get(f"https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/{resp['data']['home']}-sky/{resp['data']['destination']}-sky/{resp['data']['start']}",
        params = { 'inboundpartialdate': resp['data']['end'] },
        headers = {
      "x-rapidapi-key": RAPID_KEY,
      "x-rapidapi-host":
        "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        })
        return jsonify(flight_data = flight_data.json(), user_data = session[CURR_USER_KEY]);
    
    return jsonify(error = "Invalid Home Airport")

@app.route('/image', methods = ["POST"])
def get_destination_image():
    resp = request.json
    image_data = requests.get(f"https://api.unsplash.com/search/photos", 
    params = { 'client_id' : UNSPLASH_KEY, 'query': resp['data'], "orientation" : 'landscape'})

    return image_data.json()

@app.route('/viewed', methods = ["POST"])
def visited():
    resp = request.json
    redirect('/home')


@app.route('/privacyPolicy')
def show_privacy_policy():
    return render_template("privacy_policy.html")

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/fb-login')
def fb_login():
    facebook = requests_oauthlib.OAuth2Session(
        FB_ID, redirect_uri = URL + "/fb-callback", scope=FB_SCOPE
    )
    authorization_url, _ = facebook.authorization_url(FB_AUTHORIZATION_BASE_URL)

    return redirect(authorization_url)

@app.route("/fb-callback")
def callback():
    ruri = f"{URL}/fb-callback"

    # https://127.0.0.1:5000/fb-callback
    facebook = requests_oauthlib.OAuth2Session(
        FB_ID, scope=FB_SCOPE, redirect_uri = ruri
    )

    # we need to apply a fix for Facebook here
    facebook = facebook_compliance_fix(facebook)

    facebook.fetch_token(
        FB_TOKEN_URL,
        client_secret=FB_KEY,
        authorization_response= request.url,
    )

    # Fetch a protected resource, i.e. user profile, via Graph API

    facebook_user_data = facebook.get(
        "https://graph.facebook.com/me?fields=id,name,email,picture{url}"
    ).json()

    email = facebook_user_data["email"]
    name = facebook_user_data["name"]
    image_url = facebook_user_data.get("picture", {}).get("data", {}).get("url")
    user = User.query.filter(User.email == email).first()
    print('1111111111')
    print(user)
    if user == None:
        user = User(
        email=email,
        name=name,
        image_url=image_url
        )
        db.session.add(user)
        db.session.commit()
    session[CURR_USER_KEY] = user.email
    return redirect('/home')

# TODO: CREATE 404 page
