import { useState, useEffect } from 'react'

const API_URL = '/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const res = await fetch(API_URL)
    const data = await res.json()
    setTasks(data)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, priority: newPriority }),
    })
    const task = await res.json()
    setTasks([...tasks, task])
    setNewTitle('')
  }

  async function updateStatus(id, status) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const updated = await res.json()
    setTasks(tasks.map(t => (t.id === id ? updated : t)))
  }

  async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const statusColors = {
    'todo': '#e2e8f0',
    'in-progress': '#fef3c7',
    'done': '#d1fae5',
  }

  return (
    <div className="app">
      <header>
        <h1>🚀 Otto Task Tracker</h1>
        <p className="subtitle">Manage your tasks efficiently</p>
      </header>

      <form onSubmit={addTask} className="add-form">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new task..."
          className="task-input"
        />
        <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="priority-select">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="add-btn">Add</button>
      </form>

      <div className="filters">
        {['all', 'todo', 'in-progress', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? 'active' : ''}`}>
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 && <p className="empty">No tasks found</p>}
        {filteredTasks.map(task => (
          <div key={task.id} className="task-card" style={{ borderLeft: `4px solid ${statusColors[task.status] || '#e2e8f0'}` }}>
            <div className="task-content">
              <h3 className={task.status === 'done' ? 'done-title' : ''}>{task.title}</h3>
              <div className="task-meta">
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                <span className="date">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="task-actions">
              <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button onClick={() => deleteTask(task.id)} className="delete-btn">✕</button>
            </div>
          </div>
        ))}
      </div>

      <footer>
        <p>{tasks.length} task{tasks.length !== 1 ? 's' : ''} • {tasks.filter(t => t.status === 'done').length} completed</p>
      </footer>
    </div>
  )
}

export default App
