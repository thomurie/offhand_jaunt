from app import db
from models import Locations, User
from helpers import read_iata_codes

db.drop_all()
db.create_all()

# Import Json. Insert JSON into Database. 
iata_data = read_iata_codes();

for d in iata_data:
    print(d, iata_data[d])
    new_loc = Locations(iata = d, name = iata_data[d])
    db.session.add(new_loc)

# Create a guest user.
guest = User(email = 'guest@aol.com', name = 'Guest User')
db.session.add(guest);

db.session.commit()