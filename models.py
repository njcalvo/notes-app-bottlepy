from peewee import *
import datetime as dt

db = SqliteDatabase('app.db')

class BaseEntity(Model):
    class Meta:
        database = db

class User(BaseEntity):
    email = CharField()
    password = CharField()
    created_at = DateTimeField(default = dt.datetime.now)

class Note(BaseEntity):
    title = CharField()
    content = TextField(null=True)
    user = ForeignKeyField(User, backref='notes')
    created_at = DateTimeField(default = dt.datetime.now)

def create_tables():
    db.create_tables([Note, User])