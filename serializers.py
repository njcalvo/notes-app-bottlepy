from marshmallow import Schema, fields, post_load, validate
from models import Note, User

class UserSchema(Schema):
    id = fields.Int()
    email = fields.Str(required=True, validate = validate.Email())
    password = fields.Str(required=True, validate = validate.Length(min=5), load_only=True)
    created_at = fields.DateTime(dump_only=True)

    class Meta:
        ordered = True

    @post_load
    def make_object(self, data, **kwargs):
        if not data:
            return None
        return User(**data)

class NoteSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate = validate.Length(min=5))
    content = fields.Str(required=False)
    user = fields.Nested(UserSchema, only=['id'])
    created_at = fields.DateTime(dump_only=True)

    class Meta:
        ordered = True
    
    @post_load
    def make_object(self, data, **kwargs):
        if not data:
            return None
        return Note(**data)

class LoginSchema(Schema):
    email = fields.Str(required=True, validate = validate.Email())
    password = fields.Str(required=True, validate = validate.Length(min=5))