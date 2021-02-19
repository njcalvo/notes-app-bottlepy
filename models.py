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

    class Meta:
        table_name = 'users'

class Note(BaseEntity):
    title = CharField()
    content = TextField(null=True)
    user = ForeignKeyField(User, backref='notes')
    created_at = DateTimeField(default = dt.datetime.now)

    class Meta:
        table_name = 'notes'

def create_tables():
    with db:
        db.create_tables([Note, User])