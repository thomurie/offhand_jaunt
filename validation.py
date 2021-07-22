import random
import os
from dotenv import load_dotenv

project_folder = os.path.expanduser('/offhand_jaunt')
load_dotenv(os.path.join(project_folder, '.env'))

RAPID_KEY = os.getenv("RAPID_KEY")
UNSPLASH_KEY = os.getenv("UNSPLASH_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
FLASK_KEY=os.getenv("FLASK_KEY")

filename = 'iata_codes.txt'

with open(filename, 'r') as a:
        data = a.read().split()

def random_choice(arr):
    random_index = random.randint(0,len(arr)-1)
    n = arr[random_index]
    return n


