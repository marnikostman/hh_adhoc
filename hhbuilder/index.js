const createHousehold = (reducer) => {
    let state;
    let listeners = [];

    const getState = () => state;

    const subscribe = (listener) => {
        listeners.push(listener);
        return function () {
            listeners = listeners.filter(function (l) { return l !== listener })
        }
    }

    const dispatch = (action) => {
        state = reducer(state, action)
        listeners.forEach((listener) => listener())
    }

    return {
        getState,
        subscribe,
        dispatch
    }
}

const ADD_PERSON = "ADD_PERSON";
const REMOVE_PERSON = "REMOVE_PERSON";

const addPersonAction = (person) => {
    return {
        'type': ADD_PERSON,
        'person': person
    }
}

const removePersonAction = (id) => {
    return {
        'type': REMOVE_PERSON,
        'id': id
    }
}

const validator = (store, action) => {
    if (action.type === ADD_PERSON && (typeof action.person.age === 'undefined' || typeof action.person.age == null || action.person.age === "")) {
        return alert('An age entry is required.');
    } else if (action.type === ADD_PERSON && (isNaN(parseInt(action.person.age)) || parseInt(action.person.age) < 0)) {
        return alert('You have entered an invalid age.');
    } else if (action.type === ADD_PERSON && (typeof action.person.rel === 'undefined' || typeof action.person.rel == null || action.person.rel === "")) {
        return alert('A relationship entry is required.');
    }

    return store.dispatch(action);
}

const people = (state = [], action) => {
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

const app = (state = {}, action) => {
    return {
        'people': people(state.people, action),
    }
}

let store = createHousehold(app);

store.subscribe(() => {
    var household = store.getState();
    document.getElementsByClassName('household')[0].innerHTML = '';

    household.people.forEach(addPersonToDOM);
})

const addPersonToDOM = (person) => {
    let node = document.createElement('li');
    let personText = 'Age: ' + person.age + ', ' + 'Relationship: ' + person.rel + ', ' + 'Smoker: ' + (person.smoker ? 'true' : 'false');
    let text = document.createTextNode(personText);
    let removeBtn = createRemoveButton(function () {
        validator(store, removePersonAction(person.id))
    });
    node.appendChild(text);
    node.appendChild(removeBtn);

    document.getElementsByClassName('household')[0].appendChild(node);
}

const generateId = () => {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

const createRemoveButton = (onClick) => {
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = "X";
    removeBtn.addEventListener('click', onClick);

    return removeBtn;
}

const addPerson = () => {
    event.preventDefault();
    let input_age = document.getElementsByName('age')[0];
    let age = input_age.value
    input_age.value = '';
    let input_rel = document.getElementsByName('rel')[0];
    let rel = input_rel.value;
    input_rel.value = '';
    let input_smoker = document.getElementsByName('smoker')[0];
    let smoker = input_smoker.checked;
    input_smoker.checked = false;
    validator (store, addPersonAction({
        'id': generateId(),
        'age': age,
        'rel': rel,
        'smoker': smoker
    }));
}

document.getElementsByClassName('add')[0].addEventListener('click', addPerson);
document.getElementsByTagName('form')[0].addEventListener('submit', fakeJSON);
