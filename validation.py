import random
import os
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
        data = a.read().split()

def random_choice(arr):
    random_index = random.randint(0,len(arr)-1)
    n = arr[random_index]
    return n



