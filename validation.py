# standard libraries
import random
import os
import json

# third party libraries
import requests
from dotenv import load_dotenv

load_dotenv()

RAPID_KEY = os.getenv("RAPID_KEY")
UNSPLASH_KEY = os.getenv("UNSPLASH_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
FLASK_KEY = os.getenv("FLASK_KEY")
FB_KEY = os.getenv("FB_KEY")
FB_ID = os.getenv("FB_ID")

filename = 'iata_codes.txt'

with open(filename, 'r') as a:
        iata_data = a.read().split()

def random_choice(arr):
    random_index = random.randint(0,len(arr)-1)
    n = arr[random_index]
    return n

def flight_api_query(input_obj, user = "Guest"):
        """[summary]

        Args:
            input_obj (obj): user input data json converted to object
            user (str, optional): Is their a logged in user?. Defaults to "Guest".

        Returns:
            JSON: flight_data (obj), user_data (str)
        """

        if input_obj['home'] in iata_data:
                flight_data = requests.get(f"https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/{input_obj['home']}-sky/{input_obj['destination']}-sky/{input_obj['start']}",
                params = { 'inboundpartialdate': input_obj['end'] },
                headers = {
                        "x-rapidapi-key": RAPID_KEY,
                        "x-rapidapi-host":
                        "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
                        })
                return json.dumps(
                        {'flight_data':flight_data.json(),
                        'user_data':user,
                        'error': False,
                        })

def image_api_query(query_input):
        """Queries IMAGE API

        Args:
                data: (str): Keyword

        Returns:
                JSON: image_data (obj)
        """
        image_data = requests.get(f"https://api.unsplash.com/search/photos", 
        params = { 'client_id' : UNSPLASH_KEY, 'query': query_input, "orientation" : 'landscape' })

        return image_data.json()