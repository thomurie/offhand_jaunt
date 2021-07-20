import random
filename = f'iata_codes.txt'
with open(filename, 'r') as a:
        data = a.read().split()

def random_choice(arr):
    random_index = random.randint(0,len(arr)-1)
    n = arr[random_index]
    return n

rapid_api_key = None

rapid_api = f'keys/rapid_api.txt'
with open(rapid_api, 'r') as b:
    rapid_api_key = b.read()

unsplash_key = None

unsplash_api = f'keys/unsplash.txt'

with open(unsplash_api, 'r') as c:
    unsplash_key = c.read()

flask_key = None

flask_file = f'keys/flask_key.txt'

with open(flask_file, 'r') as d:
    flask_key = d.read()