from app import db
from models import Locations
from validation import iata_data

db.drop_all()
db.create_all()

for d in iata_data:
    new_loc = Locations(iata = d)
    db.session.add(new_loc)

db.session.commit()