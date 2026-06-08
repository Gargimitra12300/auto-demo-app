const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');

const TEST_PORT = 3099;
process.env.PORT = TEST_PORT.toString();

const app = require('./index');
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function waitForServer(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Server did not start in time');
}

describe('Task API', () => {
  before(async () => { await waitForServer(); });
  after(() => { app.server.close(); });

  // --- Health ---
  test('GET /api/health returns ok status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.timestamp);
  });

  // --- GET all tasks ---
  test('GET /api/tasks returns an array of tasks', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
  });

  test('GET /api/tasks - each task has required fields', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    const tasks = await res.json();
    for (const task of tasks) {
      assert.ok(task.id, 'task should have an id');
      assert.ok(task.title, 'task should have a title');
      assert.ok(task.status, 'task should have a status');
      assert.ok(task.priority, 'task should have a priority');
      assert.ok(task.createdAt, 'task should have a createdAt');
    }
  });

  // --- POST create task ---
  test('POST /api/tasks creates a new task with all fields', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test task', priority: 'high' }),
    });
    assert.strictEqual(res.status, 201);
    const task = await res.json();
    assert.strictEqual(task.title, 'Test task');
    assert.strictEqual(task.priority, 'high');
    assert.strictEqual(task.status, 'todo');
    assert.ok(task.id);
    assert.ok(task.createdAt);
  });

  test('POST /api/tasks defaults priority to medium', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Default priority task' }),
    });
    assert.strictEqual(res.status, 201);
    const task = await res.json();
    assert.strictEqual(task.priority, 'medium');
  });

  test('POST /api/tasks returns 400 when title is missing', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'low' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Title is required');
  });

  // --- GET single task ---
  test('GET /api/tasks/:id returns a specific task', async () => {
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Find me' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${BASE_URL}/api/tasks/${created.id}`);
    assert.strictEqual(res.status, 200);
    const task = await res.json();
    assert.strictEqual(task.id, created.id);
    assert.strictEqual(task.title, 'Find me');
  });

  test('GET /api/tasks/:id returns 404 for non-existent task', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/nonexistent-id`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Task not found');
  });

  // --- PUT update task ---
  test('PUT /api/tasks/:id updates a task', async () => {
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Update me' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${BASE_URL}/api/tasks/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated', status: 'done' }),
    });
    assert.strictEqual(res.status, 200);
    const task = await res.json();
    assert.strictEqual(task.title, 'Updated');
    assert.strictEqual(task.status, 'done');
    assert.strictEqual(task.id, created.id);
  });

  test('PUT /api/tasks/:id preserves the original id', async () => {
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'ID check' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${BASE_URL}/api/tasks/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'hacked-id', title: 'ID check updated' }),
    });
    const task = await res.json();
    assert.strictEqual(task.id, created.id);
    assert.notStrictEqual(task.id, 'hacked-id');
  });

  test('PUT /api/tasks/:id returns 404 for non-existent task', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/nonexistent-id`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Nope' }),
    });
    assert.strictEqual(res.status, 404);
  });

  // --- DELETE task ---
  test('DELETE /api/tasks/:id removes a task and returns 204', async () => {
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Delete me' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${BASE_URL}/api/tasks/${created.id}`, {
      method: 'DELETE',
    });
    assert.strictEqual(res.status, 204);

    // Verify deletion
    const getRes = await fetch(`${BASE_URL}/api/tasks/${created.id}`);
    assert.strictEqual(getRes.status, 404);
  });

  test('DELETE /api/tasks/:id returns 404 for non-existent task', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/nonexistent-id`, {
      method: 'DELETE',
    });
    assert.strictEqual(res.status, 404);
  });
});
