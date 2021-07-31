from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

def connect_db(app):

    db.app = app
    db.init_app(app)

class Locations(db.Model):

    __tablename__ = "locations"

    id = db.Column(db.Integer, autoincrement =True)

    iata = db.Column(db.String(3), nullable = False, primary_key = True, unique = True)

    name = db.Column(db.String(100), nullable = True)

class Viewed(db.Model):

    __tablename__ = 'viewed'

    id = db.Column(db.Integer, autoincrement =True, primary_key = True)

    user = db.Column(
        db.Text,
        db.ForeignKey('user.email', ondelete ="CASCADE")
    )

    location = db.Column(
        db.String(3),
        db.ForeignKey('locations.iata', ondelete ="CASCADE")
    )

class Watching(db.Model):

    __tablename__ = 'watching'

    id = db.Column(db.Integer, autoincrement =True, primary_key = True)

    user = db.Column(
        db.Text,
        db.ForeignKey('user.email', ondelete ="CASCADE")
    )

    origin = db.Column(
        db.String(3),
        nullable=False
    )

    destination = db.Column(
        db.String(3),
        db.ForeignKey('locations.iata', ondelete ="CASCADE"), nullable = False,
    )

    start = db.Column(
        db.String(30), nullable =False, default = datetime.utcnow())

    end = db.Column(
        db.String(30), nullable =True, default = datetime.utcnow())

    price = db.Column(db.Integer, nullable = False)

    
class User(db.Model):

    __tablename__ = 'user'

    id = db.Column(db.Integer, autoincrement =True)

    email = db.Column(db.Text, nullable = False, primary_key = True, unique = True)

    name = db.Column(db.String(100), nullable = False)

    image_url = db.Column(db.String(10000), nullable = True, default = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCDe5JZ_HkfuU5VFQDlF0j1jeCl-SCj_mJdA&usqp=CAU')

    viewed = db.relationship("Locations", secondary = "viewed")

    watching = db.relationship('Locations', secondary = "watching")
