const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next)
{
  const { username } = request.headers;

  const user = users.find(x => x.username === username);

  if (!user)
    return res.status(404).json({ error: `User ${username} not found!` });

  request.user = user;

  return next();
}

app.post('/users', (request, response) =>
{
  const { name, username } = request.body;

  const userAlreadyExists = users.some(x => x.username === username);

  if (userAlreadyExists)
    return response.status(400).send({ error: `User ${username} already exists` });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) =>
{
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) =>
{
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) =>
{
  const { user } = request;

  const { id } = request.params;

  const { title, deadline } = request.body;

  const todo = user.todos.find(x => x.id === id);

  if (!todo)
    return response.status(404).json({ error: `Todo ${id} id not found!` });

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) =>
{
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find(x => x.id === id);

  if (!todo)
    return response.status(404).json({ error: `Todo ${id} id not found!` });

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) =>
{
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find(x => x.id === id);

  if (!todo)
    return response.status(404).json({ error: `Todo ${id} id not found!` });

  user.todos.splice(todo, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;