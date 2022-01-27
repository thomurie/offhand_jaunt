# standard libraries
from ast import Try
import random
import os
from datetime import date
import json
from itsdangerous import exc
import requests
from dotenv import load_dotenv
from duffel_api import Duffel
load_dotenv()
from helpers import read_iata_codes
# third party libraries\
DUFFEL_KEY = os.getenv("DUFFEL_KEY")

duffel = Duffel(access_token=DUFFEL_KEY)


RAPID_KEY = os.getenv("RAPID_KEY")
UNSPLASH_KEY = os.getenv("UNSPLASH_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
FLASK_KEY = os.getenv("FLASK_KEY")
FB_KEY = os.getenv("FB_KEY")
FB_ID = os.getenv("FB_ID")

def random_iata():
        iatas = list(read_iata_codes().keys())
        random_index = random.randint(0,len(iatas)-1)
        return iatas[random_index]

def flight_api_query(request):
        """[summary]

        Args:
            input_obj (obj): user input data json converted to object
            user (str, optional): Is their a logged in user?. Defaults to "Guest".

        Returns:
            JSON: flight_data (obj), user_data (str)
        """
        slices = [
                {
                        "origin": request["departure"]["iata"],
                        "destination": request["destination"]["iata"],
                        "departure_date": request["date"]["start"]
                },
                {
                        "origin": request["destination"]["iata"],
                        "destination": request["departure"]["iata"],
                        "departure_date": request["date"]["end"]
                }
        ]
        passengers = [{ "type": "adult" }]
        try:

                OFFER_REQUEST_ID = duffel.offer_requests.create().slices(slices).passengers(passengers).cabin_class("economy").execute()
                flight_data = requests.get(
                        f'https://api.duffel.com/air/offers?offer_request_id={OFFER_REQUEST_ID.id}&sort=total_amount&limit=1', 
                        headers = 
                                {
                                "Accept-Encoding": "gzip",
                                "Accept": "application/json",
                                "Content-Type": "application/json",
                                "Duffel-Version": "beta",
                                "Authorization": f"Bearer {DUFFEL_KEY}"
                                }
                        )

                response = {
                        'departure': {
                                'iata': request["departure"]["iata"],
                                'name': flight_data.json()['data'][0]['slices'][0]["origin"]["city_name"],
                                'country': flight_data.json()['data'][0]['slices'][0]["origin"]["iata_country_code"],
                        },
                        'destination': {
                                'iata': request["destination"]["iata"],
                                'name': flight_data.json()['data'][0]['slices'][0]["destination"]["city_name"],
                                'country': flight_data.json()['data'][0]['slices'][0]["destination"]["iata_country_code"],
                        },
                        'flight': {
                                'price': flight_data.json()['data'][0]['base_amount'],
                                'carrier': flight_data.json()['data'][0]['owner']['name'],
                        },
                }
                
                request.update(response)

                image_api_query(request)

        except:
                request['error']['status'] = True
                request['error']['msg'] = 'An API error occured. Please validate the dates and the IATA codes then try again'        

        return request

def image_api_query(request):
        """Queries IMAGE API

        Args:
                data: (str): Keyword

        Returns:
                JSON: image_data (obj)
        """
        try:
                image_data = requests.get(
                        f"https://api.unsplash.com/search/photos", 
                        params = { 
                                "client_id" : UNSPLASH_KEY, 
                                "query": request['destination']['name'], 
                                "orientation" : "landscape" 
                        }
                )

                image_update = {
                        'src': image_data.json()['results'][2]['urls']['regular'], 
                        'info': image_data.json()['results'][2]['links']['html']
                }

                request['img'].update(image_update)
                
        except:
                request['error']['status'] = True
                request['error']['msg'] = 'An API error occured. Please validate the dates and the IATA codes then try again'        

        return request

def validateIata(iata):
        iatas = set((read_iata_codes().keys()))
        return iata in iatas
                

def validateDates(start, end):
        today = date.today().strftime("%Y%m%d")

        todayNum = int(today)
        startNum = int("".join(start.split('-')))
        endNum = int("".join(end.split('-')))


        if startNum < todayNum or startNum > endNum:
                return False
                
        return True
