"use strict";

// generate id
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Local storage
let localStorageName = "data";

// variables
let theme = document.querySelector("#theme");
let darkMode = document.querySelector("#darkMode");
let inputTodo = document.querySelector("#inputTodo");
let contentTodo = document.getElementById("content-todo");
let itemLeftTodos = document.getElementById("itemLeftTodos");
let all = document.querySelector("#all");
let active = document.querySelector("#active");
let completed = document.querySelector("#completed");
let clearCompleted = document.querySelector("#clearCompleted");

// Themes
darkMode.addEventListener("click", () => {
  let lightMode = document.querySelector("#lightMode");

  if (!lightMode) {
    darkMode.setAttribute("src", "./images/icon-moon.svg");
    theme.setAttribute("href", "./styles/lightMode.css");
    darkMode.setAttribute("id", "lightMode");
  } else {
    lightMode.setAttribute("id", "darkMode");
    lightMode.setAttribute("src", "./images/icon-sun.svg");
    theme.setAttribute("href", "./styles/darkMode.css");
  }
});

// add todo
inputTodo.addEventListener("keydown", (event) => {
  let keyCode = event.keyCode;
  if (keyCode === 13 && inputTodo.value.length > 0) {
    /********* Local storage **********/
    let todo = {
      _id: uuidv4(),
      text: inputTodo.value,
      state: true,
    };

    appendObjectToLocalStorage(todo);
    /********* **********/
    inputTodo.value = "";
    event.preventDefault();
  }
});

// LOCAL STORAGE

// append local storage
function appendObjectToLocalStorage(obj) {
  var todos = [],
    dataInLocalStorage = localStorage.getItem(localStorageName);

  if (dataInLocalStorage !== null) {
    todos = JSON.parse(dataInLocalStorage);
  }

  todos.push(obj);

  localStorage.setItem(localStorageName, JSON.stringify(todos));

  getTodos();
}

// get Todos
function getTodos() {
  let todos = [],
    dataInLocalStorage = localStorage.getItem(localStorageName);

  if (dataInLocalStorage !== null) {
    todos = JSON.parse(dataInLocalStorage);
  }
  loadFromLocalStorage(todos);
}

// load local storage
function loadFromLocalStorage(todos) {
  // let todos = [],
  //   dataInLocalStorage = localStorage.getItem(localStorageName);

  // if (dataInLocalStorage !== null) {
  //   todos = JSON.parse(dataInLocalStorage);
  // }

  contentTodo.innerHTML = "";

  todos.forEach((todo, i) => {
    let li = document.createElement("li");
    li.setAttribute("id", todo._id);
    li.setAttribute("data-id", i);
    li.innerHTML = todoTemplate(todo);
    contentTodo.prepend(li);

    // Completed Todo
    let completedTodo = document.querySelector("#completedTodo");
    let textContent = document.querySelector("#textContent");
    completedTodo.addEventListener("click", function () {
      completedTodoItem(todo, completedTodo, textContent);
    });

    // delete todo
    let deleteTodo = document.getElementById("deleteTodo");
    deleteTodo.addEventListener("click", () => removeFromLocalStorage(i));

    // items left
    itemLeft();
  });
}

getTodos();

// remove local storage
function removeFromLocalStorage(index) {
  var todos = [],
    dataInLocalStorage = localStorage.getItem(localStorageName);

  todos = JSON.parse(dataInLocalStorage);

  if (index !== -1) {
    todos.splice(index, 1);
  }

  localStorage.setItem(localStorageName, JSON.stringify(todos));

  loadFromLocalStorage(todos);
}

//Todo template
function todoTemplate(todo) {
  return `
      <span id="completedTodo" class=${!todo.state ? "active" : ""}></span>
      <p id="textContent" class=${!todo.state ? "strikethrough" : ""}>${
    todo.text
  }</p>
      <img id="deleteTodo" src="./images/icon-cross.svg" alt="delete-todo" />
    `;
}

// Completed Todo
function completedTodoItem(todo, completedTodo, textContent) {
  completedTodo.classList.toggle("active");
  textContent.classList.toggle("strikethrough");

  let todos = [],
    dataInLocalStorage = localStorage.getItem(localStorageName);

  todos = JSON.parse(dataInLocalStorage);

  todos.forEach((todoStorage) => {
    if (todoStorage._id === todo._id && todoStorage.state) {
      todoStorage.state = false;
      localStorage.setItem(localStorageName, JSON.stringify(todos));
    } else if (todoStorage._id === todo._id && !todoStorage.state) {
      todoStorage.state = true;
      localStorage.setItem(localStorageName, JSON.stringify(todos));
    }
  });

  itemLeft();
}

// Items left
function itemLeft() {
  let todos = [],
    dataInLocalStorage = localStorage.getItem(localStorageName);

  todos = JSON.parse(dataInLocalStorage);

  let numberItemsTodo = {
    itemsLeft: todos.length,
    itemsCompleted: 0,
  };

  todos.forEach((todo) => {
    if (!todo.state) {
      numberItemsTodo.itemsCompleted += 1;
    }
  });
  localStorage.setItem("numberItemsTodo", JSON.stringify(numberItemsTodo));

  let getNumberItemsTodos = JSON.parse(localStorage.getItem("numberItemsTodo"));

  itemLeftTodos.innerHTML =
    getNumberItemsTodos.itemsLeft - getNumberItemsTodos.itemsCompleted;
}

// CLEAR COMPLETED
clearCompleted.addEventListener("click", () => {
  let newTodos = filterTodos(false);

  localStorage.setItem(localStorageName, JSON.stringify(newTodos));

  getTodos();
});

// FILTERS

all.addEventListener("click", function () {
  // filter active
  active.classList.remove("activeFilter");
  this.classList.toggle("activeFilter");
  completed.classList.remove("activeFilter");

  //filter load
  getTodos();
});

active.addEventListener("click", function () {
  // filter active
  all.classList.remove("activeFilter");
  this.classList.toggle("activeFilter");
  completed.classList.remove("activeFilter");

  //filter load
  let newTodos = filterTodos(false);
  loadFromLocalStorage(newTodos);
});

completed.addEventListener("click", function () {
  // filter active
  all.classList.remove("activeFilter");
  this.classList.toggle("activeFilter");
  active.classList.remove("activeFilter");

  //filter load
  let newTodos = filterTodos(true);
  loadFromLocalStorage(newTodos);
});

function filterTodos(value) {
  let todos = [],
    dataInLocalStorage = localStorage.getItem(localStorageName);

  todos = JSON.parse(dataInLocalStorage);

  let newTodos = todos.filter((e) => {
    if (e.state !== value) return e;
  });

  return newTodos;
}

// Sortable js
Sortable.create(contentTodo, {
  animation: 150,
  chosenClass: "selection",
  dragClass: "drag",
  group: "list-todo",
  store: {
    // save order
    set: (sortable) => {
      const order = sortable.toArray();
      localStorage.setItem(sortable.options.group.name, order.join("|"));
    },

    // get order
    get: (sortable) => {
      const order = localStorage.getItem(sortable.options.group.name);
      return order ? order.split("|") : [];
    },
  },
});
