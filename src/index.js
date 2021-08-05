const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
      return response.status(404).json({ error: 'User not found' });
  }

  request.username = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists) {
    response.status(400).json({ error: 'User already exists' });
  }

  const userObject = {
    id: uuidv4(),
    username,
    name,
    todos: []
  }

  users.push(userObject);

  return response.status(201).json(userObject);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const todoObject = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  }

  username.todos.push(todoObject);

  return response.status(201).json(todoObject);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoIndex = username.todos.findIndex(todo => todo.id === id);
  if(!username.todos[todoIndex]) {
    return response.status(404).json({ error: 'To-do not found' });
  }

  username.todos[todoIndex].title = title;
  username.todos[todoIndex].deadline = new Date(deadline);

  return response.json(username.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todoIndex = username.todos.findIndex(todo => todo.id === id);
  if(!username.todos[todoIndex]) {
    return response.status(404).json({ error: 'To-do not found' });
  }

  username.todos[todoIndex].done = true;

  return response.json(username.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todoIndex = username.todos.findIndex(todo => todo.id === id);
  if(!username.todos[todoIndex]) {
    return response.status(404).json({ error: 'To-do not found' });
  }

  username.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;