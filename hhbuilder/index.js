function createHousehold (reducer) {
    var state;
    var listeners = [];

    var getState = function () {
        return state
    };

    var subscribe = function (listener) {
        listeners.push(listener);
        return function () {
            listeners = listeners.filter(function (l) { return l !== listener })
        }
    }

    var dispatch = function (action) {
        state = reducer(state, action)
        listeners.forEach((listener) => listener())
    }

    return {
        getState,
        subscribe,
        dispatch
    }
}

var ADD_PERSON = "ADD_PERSON";
var REMOVE_PERSON = "REMOVE_PERSON";

function addPersonAction (person) {
    return {
        'type': ADD_PERSON,
        'person': person
    }
}

function removePersonAction (id) {
    return {
        'type': REMOVE_PERSON,
        'id': id
    }
}

function validator (store, action) {
    if (action.type === ADD_PERSON && (typeof action.person.age === 'undefined' || typeof action.person.age == null || action.person.age === "")) {
        return alert('An age entry is required.');
    } else if (action.type === ADD_PERSON && (isNaN(parseInt(action.person.age)) || parseInt(action.person.age) < 0)) {
        return alert('You have entered an invalid age.');
    } else if (action.type === ADD_PERSON && (typeof action.person.rel === 'undefined' || typeof action.person.rel == null || action.person.rel === "")) {
        return alert('A relationship entry is required.');
    }

    return store.dispatch(action);
}

function people (state = [], action) {
    switch(action.type){
        case ADD_PERSON:
            return state.concat([action.person]);
        case REMOVE_PERSON:
            return state.filter(function (person) {
                return person.id !== action.id
            });
        default:
            return state
    }
}

function app (state = {}, action) {
    return {
        'people': people(state.people, action),
    }
}

var store = createHousehold(app);

store.subscribe(() => {
    var household = store.getState();
    document.getElementsByClassName('household')[0].innerHTML = '';

    household.people.forEach(addPersonToDOM);
})

function addPersonToDOM (person) {
    var node = document.createElement('li');
    var personText = 'Age: ' + person.age + ', ' + 'Relationship: ' + person.rel + ', ' + 'Smoker: ' + (person.smoker ? 'true' : 'false');
    var text = document.createTextNode(personText);
    var removeBtn = createRemoveButton(function () {
        validator(store, removePersonAction(person.id))
    });
    node.appendChild(text);
    node.appendChild(removeBtn);

    document.getElementsByClassName('household')[0].appendChild(node);
}

function generateId() {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

function createRemoveButton (onClick) {
    var removeBtn = document.createElement('button');
    removeBtn.innerHTML = "X";
    removeBtn.addEventListener('click', onClick);

    return removeBtn;
}

function addPerson () {
    event.preventDefault();
    var input_age = document.getElementsByName('age')[0];
    var age = input_age.value
    input_age.value = '';
    var input_rel = document.getElementsByName('rel')[0];
    var rel = input_rel.value;
    input_rel.value = '';
    var input_smoker = document.getElementsByName('smoker')[0];
    var smoker = input_smoker.checked;
    input_smoker.checked = false;
    validator (store, addPersonAction({
        'id': generateId(),
        'age': age,
        'rel': rel,
        'smoker': smoker
    }));
}

function fakeJSON () {
    event.preventDefault();
    var jsonText = JSON.stringify(store.getState());

    document.getElementsByTagName('pre')[0].innerText = jsonText;

    //var xhr = new XMLHttpRequest();
    //xhr.open('POST', '/server', true);
    //xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    //xhr.send(JSON.stringify(data));

    //xhr.onloadend = function () {
        // console.log('Your form has been submitted.')
    //};
}

document.getElementsByClassName('add')[0].addEventListener('click', addPerson);
document.getElementsByTagName('form')[0].addEventListener('submit', fakeJSON);
