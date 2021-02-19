from bottle import app, run, error, get, post, put, delete, route, response, request, hook
from marshmallow import ValidationError
from bottle_cors_plugin import cors_plugin
from models import db, Note, User, create_tables
from serializers import NoteSchema, LoginSchema, UserSchema
import bcrypt
import json
import peewee
import jwt
import datetime as dt
import os

JWT_SECRET = '8hd87b9bHBDU7NDS9DNi3nf903m'
JWT_EXP_TIME = 3600

create_tables()

@get('/')
def index():
    return { 'message': 'Aimo Backend Technical Test' }

def response_data(code, message):
    res = {
        "statusCode": code,
        "message": message
    }

    response.status = int(code)
    response.set_header('Access-Control-Allow-Origin', '*')
    response.headers['Content-Type'] = 'application/json'
    return json.dumps(res) 

@error(400)
@error(401)
@error(403)
@error(404)
@error(405)
@error(409)
@error(500)
def error(error):
    error_string = str(error)
    error_code = error_string[1:4]
    error_message = error_string[7:-2]
    response.status = int(error_code)
    
    return response_data(error_code, error_message)

@hook('before_request')
def before_request():
    db.connect()

@hook('after_request')
def after_request():
    response.headers['Content-Type'] = 'application/json'
    db.close()

### Users
@post('/login')
def login():
    data = request.json
    schema = LoginSchema()

    try:
        login_data = schema.load(data)
    except ValidationError as error:
        return error.messages
    
    email = login_data['email']
    password = login_data['password'].encode()

    try:
        user = User.select().where(
            User.email == email).get()
    except peewee.DoesNotExist:
        return HTTPError(401, 'Email or password incorrect')

    if not bcrypt.checkpw(password, user.password.encode()):
        return HTTPError(401, 'Email or password incorrect')
    
    payload = {
        'userId': user.id,
        'exp': dt.datetime.utcnow() + dt.timedelta(JWT_EXP_TIME)}
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

    return {"accessToken": token }

@post('/register')
def register():
    data = request.json
    schema = UserSchema()

    try:
        user = schema.load(data)
    except ValidationError as error:
        return error.messages
    
    try:
        user_exists = User.select().where(
            User.email == user.email).get()
        return response_data(409, 'Already exists an user with that email')
    except peewee.DoesNotExist:
        pass
    
    password = user.password.encode()
    user.password = bcrypt.hashpw(password, bcrypt.gensalt())
    user.save()

    return response_data(200, 'User registered')

def auth(func):
    def validate(*args, **kwargs):
        if 'Authorization' not in request.headers:
            return HTTPError(401, 'You need to login')

        header = request.headers['Authorization']
        
        header_parts = header.split()

        try:
            payload = jwt.decode(header_parts[1], JWT_SECRET, algorithms=["HS256"])
            user_id = payload['userId']
        except jwt.DecodeError:
            return HTTPError(401, 'Invalid token')
        except jwt.ExpiredSignature:
            return HTTPError(401, 'Expired token')
        
        return func(user_id, *args, **kwargs)
    
    return validate

### Notes

@get(['/notes', '/notes/'])
@auth
def get_notes(user_id):
    notes = Note.select().where(Note.user_id == user_id)
    schema = NoteSchema(many = True)
    result = schema.dumps(notes)
    return result

@get('/notes/<id:int>')
@auth
def get_one_note(user_id, id):
    try:
        note = Note.select().where(Note.id == id).get()
    except peewee.DoesNotExist:
        return HTTPError(404, 'Note does not exists')

    if note.user.id != user_id:
        return HTTPError(401, 'You need to login')

    schema = NoteSchema()
    result = schema.dumps(note)
    return result

@post('/notes')
@auth
def create_note(user_id):
    data = request.json
    schema = NoteSchema()
    
    try:
        note = schema.load(data)
    except ValidationError as error:
        return error.messages
    
    note.user = user_id
    note.save()

    return response_data(200, 'Note created')

@put('/notes/<id:int>')
@auth
def edit_note(user_id, id):
    data = request.json

    schema = NoteSchema()

    try:
        note = Note.select().where(Note.id == id).get()
    except peewee.DoesNotExist:
        return HTTPError(404, 'Note does not exists')
    
    if note.user.id != user_id:
        return HTTPError(403, 'You have not sufficient permissions')
    
    try:
        edited_note = schema.load(data, partial=True)
    except ValidationError as error:
        return error.messages

    if edited_note.title is not None:
        note.title = edited_note.title
    if edited_note.content is not None:
        note.content = edited_note.content
    
    note.save()

    result = schema.dumps(note)
    return response_data(200, 'Note edited')

@delete('/notes/<id:int>')
@auth
def delete_note(user_id, id):
    data = request.json

    try:
        note = Note.select().where(Note.id == id).get()
    except peewee.DoesNotExist:
        return HTTPError(404, 'Note does not exists')
    
    if note.user.id != user_id:
        return HTTPError(403, 'You have not sufficient permissions')
    
    note.delete_instance()

    return response_data(200, 'Note deleted')

if __name__ == '__main__':
    app = app()
    app.install(cors_plugin('*'))
    run(host='localhost', port=8000)
