const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const TODOS_FILE = path.join(__dirname, 'todos.json');


const writeTodos = (todos) => {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2), 'utf8');
};


const readTodos = (id) => {
  const todos = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
  if (id) {
    return todos.find(todo => todo.id === id);
  }
  return todos;
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/todos') {
    const todos = readTodos();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todos));
  }
  else if (req.method === 'GET' && req.url.startsWith('/todos/')) {
    const id = parseInt(req.url.split('/')[2]);
    const todo = readTodos(id);
    if (todo) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(todo));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Todo Not Found');
    }
  } 
  else if (req.method === 'POST' && req.url === '/todos') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newTodo = JSON.parse(body);
      const todos = readTodos();
      newTodo.id = todos.length ? todos[todos.length - 1].id + 1 : 1;
      todos.push(newTodo);
      writeTodos(todos);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newTodo));
    });
  } 


else if (req.method === 'DELETE' && req.url.startsWith('/todos/')) {
  const id = parseInt(req.url.split('/')[2], 10);
  const todos = readTodos();
  const remaining_todos = todos.filter(todo => todo.id !== id);
  if (todos.length === remaining_todos.length) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Todo Not Found');
  } else {
    writeTodos(remaining_todos);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Deleted Successfully' }));
  }
}


else if (req.method === 'PUT' && req.url.startsWith('/todos/')) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const id = parseInt(req.url.split('/')[2]);
    const todos = readTodos();
    const existingTodo = todos.find(todo => todo.id === id);
    if (!existingTodo) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Todo Not Found' }));
      return;
    }
    const updatedTodo = { ...existingTodo, ...JSON.parse(body) };
    const index = todos.findIndex(todo => todo.id === id);
    todos[index] = updatedTodo;
    writeTodos(todos);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedTodo));
  });
}
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
