# standard libraries
import json
from datetime import datetime

# third party libraries
from flask import Flask, render_template, redirect, session, jsonify, g, request, url_for
from flask_cors import CORS
import requests_oauthlib
from requests_oauthlib.compliance_fixes import facebook_compliance_fix

# local imports
from models import Watching, connect_db, db, User, Viewed, Watching
from validation import flight_api_query, random_choice, iata_data, image_api_query, DATABASE_URL, FLASK_KEY, FB_KEY, FB_ID

# Facebook Login
FB_AUTHORIZATION_BASE_URL = "https://www.facebook.com/dialog/oauth"
FB_TOKEN_URL = "https://graph.facebook.com/oauth/access_token"
FB_SCOPE = ["email"]

# App Data
URL = "https://offhandjaunt.herokuapp.com"
CURR_USER_KEY = "curr_user"

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = FLASK_KEY

connect_db(app)

@app.before_request
def add_user_to_g():
    """Add Curr User to Flask Global.

    Returns:
        assignment: adds logged in user to g.user
    """

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])

    else:
        g.user = None

# LANDING PAGE
@app.route('/', methods=["GET"])
def index():
    """Inital Request made to server

    Returns:
        redirect: /home
    """

    return redirect("/home")

@app.route('/home', methods=["GET"])
def home():
    """Renders home page

    Displays enhanced user experience if user is logged in
    Displays Guest home page if user is logged out

    Returns:
        render_template: 'index.html'
    """

    return render_template('index.html', user = g.user, quote = None)

#SIGN OUT
@app.route('/logout', methods = ['GET'])
def logout():
    """Renders Home Page

    Removes user from g.user and session if user is logged in
    Logged Out users will be redirected to /home

    Returns:
        redirect: /home
    """

    if g.user:
        del session[CURR_USER_KEY]

    return redirect('/home')

# LEGAL
@app.route('/privacyPolicy', methods = ['GET'])
def show_privacy_policy():
    """Renders Privacy Policy

    Displays to all users the privacy policy

    Returns:
        render_template: 'privacy_policy.html'
    """

    return render_template("privacy_policy.html", user = g.user)

#SHARE FLIGHT
@app.route('/share/<home>/<destination>/<start>/<end>')
def share_link(home, destination, start, end):
    user_input = { 
            'home': home,
            'destination': destination,
            'start': start,
            'end': end,
        }
    quote = json.loads(flight_api_query(user_input))
    print(quote['flight_data']['Carriers'][0]['Name'])
    destination = quote['flight_data']['Places'][0]
    if user_input['home'] == quote['flight_data']['Places'][0]['IataCode']:
        destination = quote['flight_data']['Places'][1]

    image = (image_api_query(destination["CityName"]))

    quote_data = {
        'input': user_input,
        'city': destination['CityName'],
        'country': destination['CountryName'],
        'price': quote['flight_data']['Quotes'][0]['MinPrice'],
        'iata': destination['IataCode'],
        'carrier': quote['flight_data']['Carriers'][0]['Name'],
        'image_url': image['results'][3]['urls']['regular'],
        'image_by': image['results'][3]['user']['name'],
        'image_attribute': image['results'][3]['user']['links']['html'],
        'url': URL
    }
    return render_template('index.html', user = g.user, quote = quote_data)


# QUERY APIS 
@app.route('/flight', methods=["POST"])
def get_flight():
    """Queries Flight API

    POST Request requires JSON { 
        data: { 
            'home': (str) 3 letter IATA Code (must be uppercase),
            'destination': (str) 3 letter IATA Code (must be uppercase) OR 'Random',
            'start': (str) must be in format YYYY-MM-DD,
            'end': (str) must be in format YYYY-MM-DD,
            }
        }
    
    Destination if 'Random' is set to a destination from data(arr from Validation)
    if g.user: 
        Destination cannot be in g.user.viewed
        Destination is added to g.user.viewed to eliminate duplicate responses from API
    Guest users are always given a random destination

    Parameters are then passed to flight_api_query 

    Returns:
        JSON: flight_data (obj), user_data (str)
    """

    resp = request.json['data']
    
    destination = random_choice(iata_data)
    user = "Guest"

    if g.user:
        user = g.user.email
        viewed = [l.iata for l in g.user.viewed]
        while destination in viewed:
            destination = random_choice(iata_data)
        add_dest = Viewed(user = g.user.email, location = destination)
        db.session.add(add_dest)
        db.session.commit()

    if resp['destination'] == 'Random':
        resp['destination'] = destination

    if resp['home'] in iata_data:
        return flight_api_query(resp, user)
    return jsonify(error = True)

@app.route('/image', methods = ["POST"])
def get_destination_image():
    """Queries IMAGE API

    POST Request requires JSON { 
        data: (str)
        }

    Returns:
        JSON: image_data (obj)
    """

    resp = request.json['data']
    return image_api_query(resp)

# USER FUNCTIONALITY
@app.route('/user', methods=["GET"])
def user_profile():
    """User Profile Page

    Logged Out Users are redirected to /home
    Logged In Users are shown the following 
        Watching (arr) - Listed of *active* flights user is watching (if len(arr) > 0)
        Viewed (arr) - Listed of locations user has seen or visited (if len(arr) > 0)
    
    *active flights are determined by comparing today's date to the start date of the flight
    expired flights are removed from the user's profile and are not shown on this page*

    Returns:
        Logged Out Users: redirect: /home
        Logged In Users: render_template: user.html
    """

    if g.user:
        d = datetime.utcnow()
        time = f"{d.strftime('%Y')}{d.strftime('%m')}{d.strftime('%d')}"
        all_watching = Watching.query.filter_by(user = g.user.email).all()
        current = []
        for s in all_watching:
            a = s.start.split('-')
            seperator= ''
            b = seperator.join(a)
            if int(b) < int(time):
                old = Watching.query.filter_by(id = s.id).first()
                db.session.delete(old)
                db.session.commit()
            else:
                current.append(s)

        return render_template('user.html', user = g.user, length = len(g.user.viewed), all_watching_length = len(all_watching), watching = current)
    return redirect('/home')

@app.route('/resetViewedVisited', methods = ["GET"])
def reset_viewed_visited():
    """Removes all Viewed/Visited Locations from the user's profile

    Logged Out Users are redirected to /home
    Logged In Users have their viewed removed then are redirected to /user
    Returns:
        Logged In Users: redirect: /user
        Logged Out Users: redirect: /home
    """

    if g.user:
        user_viewed = Viewed.query.filter_by(user = g.user.email).all()
        for view in user_viewed:
            db.session.delete(view)
            db.session.commit()
        return redirect('/user')
    return redirect('/home')

# WATCH FLIGHT
@app.route("/watchFlight", methods = ["POST"])
def add_watched_flight():
    """Adds Flight to user's Watching

    POST Request requires JSON { 
        flight: { 
            'Places': (arr) [
                (obj) {
                    IataCode: (str) 3 letter IATA Code (must be uppercase),
                    }, 
                (obj) {
                    IataCode: (str) 3 letter IATA Code (must be uppercase),
                    },
                ],
            'Quotes': (arr) [
                (obj) {
                    MinPrice: (int) base-10 non-float,
                    }, 
                ],
            },
        input: { 
            'home': (str) 3 letter IATA Code,
            'destination': (str) 3 letter IATA Code OR 'Random',
            'start': (str) must be in format YYYY-MM-DD,
            'end': (str) must be in format YYYY-MM-DD,
            }
        }

    Logged Out Users are redirected to /home
    Logged In Users have the flight added to their watching

    Returns:
        Logged In Users: JSON: data (str)
        Logged Out Users: redirect: /home
    """

    resp = request.json
    destination = resp['flight']['Places'][0]['IataCode']
    if resp['input']['home'] == resp['flight']['Places'][0]['IataCode']:
        destination = resp['flight']['Places'][1]['IataCode']
    if g.user:
        watched= Watching(
            user = g.user.email,
            origin = resp['input']['home'],
            destination = destination,
            start = resp['input']['start'],
            end = resp['input']['end'],
            price = resp['flight']['Quotes'][0]['MinPrice']
        )
        db.session.add(watched)
        db.session.commit()
        return (jsonify(data = 'Added To Watched'))

    return redirect('/home')

@app.route('/removeWatching', methods = ["POST"])
def remove_watched():
    """Removes flight from user's watching

    POST Request requires JSON { 
        data: (int)
        }

    Logged Out Users are redirected to /home
    Logged In Users have the flight removed from their watching

    Returns:
        Logged In Users: redirect: /user
        Logged Out Users: redirect: /home
    """

    if g.user:
        resp = request.json
        watched_flight = Watching.query.filter_by(id = resp['data']).first()
        db.session.delete(watched_flight)
        db.session.commit()
        return redirect('/user')
    return redirect('/home')

@app.route('/watchingData', methods = ['POST'])
def obtain_watching_data():
    """Obtains Data on a Flight in User's Watching

    POST Request requires JSON { 
        data: (int)
        }

    Logged Out Users are redirected to /home
    Logged In Users have the flight removed from their watching
    
    Returns:
        Logged In Users: JSON: data: (obj)
        Logged Out Users: redirect: /home
    """

    if g.user:
        resp = request.json
        watched_flight = Watching.query.filter_by(id = resp['data']).first()
        watched_flight_data = {
            'home': watched_flight.origin,
            'destination': watched_flight.destination,
            'start': watched_flight.start,
            'end': watched_flight.end,
        }
        return jsonify(data = watched_flight_data)
    return redirect('/home')

@app.route("/updateWatching", methods = ["POST"])
def update_watching_flight():
    """Obtains Data on a Flight in User's Watching

    POST Request requires JSON { 
        id: (int),
        price: (int),
        }

    Logged Out Users are redirected to /home
    Logged In Users have the flight data for the flight in their watching updated to the current price
    
    Returns:
        Logged In Users: JSON: increase: (bool), price: (int)
        Logged Out Users: redirect: /home
    """

    if g.user:
        resp = request.json
        watched_flight = Watching.query.filter_by(id = resp['id']).first()
        old_price = watched_flight.price
        watched_flight.price = resp['price']
        db.session.commit()
        change = old_price >= watched_flight.price
        return jsonify(increase = change, price = watched_flight.price)
    return redirect('/home')

# FACEBOOK LOGIN
@app.route('/fb-login')
def fb_login():
    """Begins Facebook Login Process

    Returns:
        redirect: authorization_url (str)
    """

    facebook = requests_oauthlib.OAuth2Session(
        FB_ID, redirect_uri = URL + "/fb-callback", scope=FB_SCOPE
    )
    authorization_url, _ = facebook.authorization_url(FB_AUTHORIZATION_BASE_URL)

    return redirect(authorization_url)

@app.route("/fb-callback")
def callback():
    """Completes Facebook Login Process

    Adds user to Database if user does not exist
    assigns user.emal to CURR_USER_KEY

    Returns:
        redirect: /home
    """

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
