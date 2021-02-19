# Notes APP
App simple para guardar notas.

### Backend
* [peewee](http://docs.peewee-orm.com/en/latest/ "peewee") (ORM)
* [bottle](https://bottlepy.org/docs/dev/ "bottle") (miniframework web)
* [sqlite](https://www.sqlite.org/ "sqlite") (database)

### Frontend
* HTML
* Javascript
* [bootstrap](https://getbootstrap.com/ "bootstrap") (framework css)

## Ejecutar
* Correr el servidor de backend:
-- python server.py
* Correr el servidor de frontend: (no es realmente necesario, basta con acceder al archivo index.html)
-- python client.py

## Test
* Aplicación funcionando: [heroku](https://aimo-notes-app.herokuapp.com/ "heroku")
* Backend: [heroku](https://aimo-notes-api.herokuapp.com/ "heroku")

### requirements.txt
* bcrypt==3.2.0
* bottle==0.12.19
* bottle-cors-plugin==0.1.9
* cffi==1.14.5
* marshmallow==3.10.0
* peewee==3.14.1
* pycparser==2.20
* PyJWT==2.0.1
* six==1.15.0
