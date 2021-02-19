# Run with "python client.py"
from bottle import get, run, static_file

@get('/')
def index():
    return static_file('index.html', root=".")

@get('/scripts.js')
def scripts():
    return static_file('scripts.js', root=".")

run(host='localhost', port=5000)
