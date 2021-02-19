let body = document.querySelector("#body");
let loginForm = document.querySelector("#loginForm");
let registerForm = document.querySelector("#registerForm");
let submitLogin = document.querySelector("#submitLogin");
let submitRegister = document.querySelector("#submitRegister");
let cardsContainer = document.querySelector("#cardsContainer");
let noteFormContainer = document.querySelector("#noteFormContainer");
let panel = document.querySelector("#panel");

const baseURL = "https://aimo-notes-api.herokuapp.com/";

const fetchJSON = (...args) => {
    return fetch(...args)
    .then(res => {
    if(res.ok) {
        return res.json()
    }
    return res.text()
        .then(text => { throw new Error(text) })
    })
  }

function bodyLoad(){
    if(localStorage.token){
        loginForm.remove()
        registerForm.remove()

        fetchJSON(baseURL + 'notes', {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + localStorage.token
            }})
        .then((json) => {
            createCards(json)
        })
        .catch(error => {
            fastAlert(JSON.parse(error.message))
        })
    }
    else
    {
        registerForm.style.visibility = 'hidden';
        panel.remove()
    }
    if(localStorage.alert){
        showAlerts()
    }
}

function createCards(json){
    json.forEach(element => {
        addCard(element)
    });
}

function addCard (element) {
    document.querySelector('#cardsContainer').insertAdjacentHTML(
        'afterbegin',
        `<div class="col mt-4" id="noteCard">
            <div class="card">
                <div class="card-header"> ` + element.title + `</div>
                <div class="card-body">
                    <p class="card-text">` + element.content + `</p>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="#" class="card-link" onclick="editNote(` + element.id + `)">Edit</a>
                    <a href="#" class="card-link" onclick="deleteNote(` + element.id + `)">Delete</a>
                </div>
            </div>
        </div>`      
    )
}

function goNotes() {
    location.reload()
}

function goRegister() {
    document.getElementById('alertsContainer').innerHTML = ""
    loginForm.style.visibility = 'hidden';
    registerForm.style.visibility = 'visible';
    document.getElementById("emailLogin").value = ''
    document.getElementById("passwordLogin").value = ''
}

function goLogin() {
    document.getElementById('alertsContainer').innerHTML = ""
    registerForm.style.visibility = 'hidden';
    loginForm.style.visibility = 'visible';
    document.getElementById("emailRegister").value = ''
    document.getElementById("passwordRegister").value = ''
}

function logout(){
    localStorage.removeItem('token')
    location.reload()
}

submitLogin.addEventListener("click", (e) => {
    e.preventDefault();

    document.getElementById('alertsContainer').innerHTML = ""

    const email = document.getElementById("emailLogin").value
    const password = document.getElementById("passwordLogin").value
    
    fetchJSON(baseURL + 'login', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        }),
        headers: {
            "Content-type": "application/json",
        }})
    .then((json) => {
        doLogin(json)
    })
    .catch(error => {
        fastAlert(JSON.parse(error.message))
    })
});

function doLogin(json){
    if(json.accessToken) {
        localStorage.token = json.accessToken
        location.reload()
    }
    else
    {
        if(json.email) {
            fastAlert({ 'message': 'Email: ' + json.email })
        }
        if(json.password) {
            fastAlert({ 'message': 'Password: ' + json.password })
        }
    }
}

submitRegister.addEventListener("click", (e) => {
    e.preventDefault();

    document.getElementById('alertsContainer').innerHTML = ""

    const email = document.getElementById("emailRegister").value
    const password = document.getElementById("passwordRegister").value

    fetchJSON(baseURL + 'register', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        }),
        mode: "cors",
        headers: {
            "Content-type": "application/json"
        }})
    .then((json) => {
        doRegister(json)
    })
    .catch(error => {
        fastAlert(JSON.parse(error.message))
    })
});

function doRegister(json){
    if(json.statusCode == 200) {
        createAlert(json)
        location.reload()
    }
    else
    {
        if(json.email) {
            fastAlert({ 'message': 'Email: ' + json.email })
        }
        if(json.password) {
            fastAlert({ 'message': 'Password: ' + json.password })
        }
    }
}

function createNote(){
    cardsContainer.remove()
    document.getElementById('alertsContainer').innerHTML = ""
    document.querySelector('#noteFormContainer').insertAdjacentHTML(
        'afterbegin',
        `<div class="col-10 col-sm-8 col-xl-4 mx-auto">
            <form>
                <h2 class="text-center my-3">Note Form</h2>
                <div class="d-grid gap-2 mb-3">
                    <input id="title" class="form-control" type="text" placeholder="Title" required>
                    <textarea id="content" class="form-control" placeholder="Content"></textarea>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary" type="submit" onclick="saveOneNote()">Save</button>
                    <a class="btn btn-dark" onclick="goNotes()">Back</a>
                </div>
            </form>
        </div>`      
    )
}

function saveOneNote(){
    const title = document.getElementById("title").value
    const content = document.getElementById("content").value

    fetchJSON(baseURL + 'notes', {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + localStorage.token,
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            content: content
        }),
    })
    .then((json) => {
        if(json.statusCode == 200) {
            createAlert(json)
            location.reload()
        }
        else
        {
            if(json.title) {
                fastAlert({ 'message': 'Title: ' + json.title })
            }
        }
    })
    .catch(error => {
        fastAlert(JSON.parse(error.message))
    })
}

function editNote(noteId){
    cardsContainer.remove()
    document.getElementById('alertsContainer').innerHTML = ""
    fetchJSON(baseURL + 'notes/' + noteId, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.token
        }})
    .then((json) => {
        createEditForm(json)
    })
    .catch(error => {
        fastAlert(JSON.parse(error.message))
    })
}

function createEditForm(note){
    document.querySelector('#noteFormContainer').insertAdjacentHTML(
        'afterbegin',
        `<div class="col-10 col-sm-8 col-xl-4 mx-auto">
            <form>
                <h2 class="text-center my-3">Note Form</h2>
                <div class="d-grid gap-2 mb-3">
                    <input id="title" class="form-control" type="text" placeholder="Title" value="` + note.title + `" required>
                    <textarea id="content" class="form-control" placeholder="Content">` + note.content + `</textarea>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary" type="submit" onclick="editOneNote(` + note.id + `)">Save</button>
                    <a class="btn btn-dark" onclick="goNotes()">Back</a>
                </div>
            </form>
        </div>`      
    )
}

function editOneNote(id){
    const title = document.getElementById("title").value
    const content = document.getElementById("content").value
    
    fetchJSON(baseURL + 'notes/' + id, {
        method: 'PUT',
        headers: {
            "Authorization": "Bearer " + localStorage.token,
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            content: content
        }),
    })
    .then((json) => {
        createAlert(json)
    })
    .catch(error => {
        fastAlert(JSON.parse(error.message))
    })
}

function deleteNote(id){
    if (confirm('Are you sure you want to delete this note?')) {
        fetchJSON(baseURL + 'notes/' + id, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.token
            },
        })
        .then((json) => {
            createAlert(json)
        })
        .catch(error => {
            fastAlert(JSON.parse(error.message))
        })
      }
}

function createAlert(json){
    alertType = `alert-warning`
    if(json.statusCode == 200) {
        alertType = `alert-primary`
    }
    localStorage.alert = 
        `<div class="alert ` + alertType + ` alert-dismissible fade show" role="alert">
            ` + json.message + `
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`
    location.reload()
}

function showAlerts() {
    document.querySelector('#alertsContainer').insertAdjacentHTML('afterbegin',localStorage.alert)
    localStorage.removeItem('alert')
}

function fastAlert(json){
    document.querySelector('#alertsContainer').insertAdjacentHTML(
        'afterbegin',
        `<div id="alert" class="alert alert-warning alert-dismissible fade show" role="alert">
            ` + json.message + `
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`)
}