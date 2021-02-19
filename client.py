# Run with "python client.py"
from bottle import get, run, static_file
import os

@get('/')
def index():
    return static_file('index.html', root=".")

@get('/scripts.js')
def scripts():
    return static_file('scripts.js', root=".")

run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
