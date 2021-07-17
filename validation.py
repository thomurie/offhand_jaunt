import random
filename = f'iata_codes.txt'
with open(filename, 'r') as f:
        data = f.read().split()

def random_choice(arr):
    random_index = random.randint(0,len(arr)-1)
    n = arr[random_index]
    return n

rapid_api_key = None

rapid_api = f'keys/rapid_api.txt'
with open(rapid_api, 'r') as f:
    rapid_api_key = f.read()

unsplash_key = None

unsplash_api = f'keys/unsplash.txt'

with open(unsplash_api, 'r') as g:
    unsplash_key = g.read()