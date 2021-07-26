from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def connect_db(app):

    db.app = app
    db.init_app(app)

class User(db.Model):

    __tablename__ = 'user'

    id = db.Column(db.Integer, autoincrement =True)

    email = db.Column(db.Text, nullable = False, primary_key = True, unique = True)

    name = db.Column(db.String(100), nullable = False)

    image_url = db.Column(db.String(10000), nullable = True, default = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCDe5JZ_HkfuU5VFQDlF0j1jeCl-SCj_mJdA&usqp=CAU')

    # viewed = db.relationship("User", secondary = "locations", primaryjoin=(Locations.iata ==) backref="user", cascade="all, delete-orphan")

    @classmethod
    def signup(cls, name, email, image_url):
        """Sign up user"""

        new_user = User(
            name=name,
            email=email,
            image_url=image_url,
        )

        db.session.add(new_user)
        return new_user


