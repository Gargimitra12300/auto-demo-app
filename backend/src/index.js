const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory task store
let tasks = [
  { id: uuidv4(), title: 'Set up project structure', status: 'done', priority: 'high', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Build REST API', status: 'in-progress', priority: 'high', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Create React frontend', status: 'todo', priority: 'medium', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Add deployment pipeline', status: 'todo', priority: 'low', createdAt: new Date().toISOString() },
];

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, priority = 'medium' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const task = {
    id: uuidv4(),
    title,
    status: 'todo',
    priority,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

// Allowed task statuses
// Bug #66: removed 'deployed' status
const allowedStatuses = new Set(['todo', 'in-progress', 'done']);

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  if (Object.prototype.hasOwnProperty.call(req.body, 'status') && !allowedStatuses.has(req.body.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id };
  res.json(tasks[idx]);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(idx, 1);
  res.status(204).send();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log('Backend running on http://localhost:' + PORT);
});

module.exports = app;
module.exports.server = server;
