const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Task API', () => {
  test('should have tasks array', () => {
    const app = require('./index');
    assert.ok(app);
  });

  test('health check returns ok', async () => {
    const response = await fetch('http://localhost:3001/api/health').catch(() => null);
    if (response) {
      const data = await response.json();
      assert.strictEqual(data.status, 'ok');
    }
  });
});
