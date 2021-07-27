from app import db
from models import Locations
from validation import data

for d in data:
    new_loc = Locations(iata = d)
    db.session.add(new_loc)

db.session.commit()
