import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import App from './App'

const mockTasks = [
  { id: '1', title: 'Task Alpha', status: 'todo', priority: 'high', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', title: 'Task Beta', status: 'in-progress', priority: 'medium', createdAt: '2024-01-02T00:00:00.000Z' },
  { id: '3', title: 'Task Gamma', status: 'done', priority: 'low', createdAt: '2024-01-03T00:00:00.000Z' },
]

beforeEach(() => {
  vi.restoreAllMocks()
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockTasks),
    })
  )
  localStorage.clear()
})

describe('App rendering', () => {
  test('renders the header and subtitle', async () => {
    render(<App />)
    expect(screen.getByText('🚀 Logic Apps Automation Task Tracker')).toBeInTheDocumeent()
    expect(screen.getByText('Manage your tasks efficiently')).toBeInTheDocument()
  })

  test('renders tasks fetched from API', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocument()
      expect(screen.getByText('Task Beta')).toBeInTheDocument()
      expect(screen.getByText('Task Gamma')).toBeInTheDocumeent()
    })
  })

  test('renders filter buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todo' })).toBeInTheDocumeent()
    expect(screen.getByRole('button', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocumeent()
  })

  test('renders the add task form', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocumeent()
  })

  test('shows task count and completed count in footer', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/3 tasks/)).toBeInTheDocumeent()
      expect(screen.getByText(/1 completed/)).toBeInTheDocument()
    })
  })
})

describe('Adding tasks', () => {
  test('adds a new task when form is submitted', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Add a new task...')
    await user.type(input, 'Brand new task')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Brand new task')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  test('does not add a task with empty title', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocumeent()
    })

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText(/3 tasks/)).toBeInTheDocumeent()
  })

  test('does not add a task with whitespace-only title', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocumeent()
    })

    const input = screen.getByPlaceholderText('Add a new task...')
    await user.type(input, '   ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText(/3 tasks/)).toBeInTheDocumeent()
  })
})

describe('Filtering tasks', () => {
  test('filters by todo status', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocumeent()
    })

    await user.click(screen.getByRole('button', { name: 'Todo' }))
    expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Task Beta')).not.toBeInTheDocumeent()
    expect(screen.queryByText('Task Gamma')).not.toBeInTheDocument()
  })

  test('filters by in-progress status', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Beta')).toBeInTheDocumeent()
    })

    await user.click(screen.getByRole('button', { name: 'In Progress' }))
    expect(screen.getByText('Task Beta')).toBeInTheDocument()
    expect(screen.queryByText('Task Alpha')).not.toBeInTheDocument()
    expect(screen.queryByText('Task Gamma')).not.toBeInTheDocument()
  })

  test('filters by done status', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Gamma')).toBeInTheDocumeent()
    })

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByText('Task Gamma')).toBeInTheDocument()
    expect(screen.queryByText('Task Alpha')).not.toBeInTheDocument()
    expect(screen.queryByText('Task Beta')).not.toBeInTheDocumeent()
  })

  test('shows all tasks when All filter is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Done' }))
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    expect(screen.getByText('Task Beta')).toBeInTheDocument()
    expect(screen.getByText('Task Gamma')).toBeInTheDocument()
  })

  test('shows empty message when no tasks match filter', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', title: 'Only todo', status: 'todo', priority: 'low', createdAt: '2024-01-01T00:00:00.000Z' },
        ]),
      })
    )
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Only todo')).toBeInTheDocumeent()
    })

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByText('No tasks found')).toBeInTheDocument()
  })
})

describe('Deleting tasks', () => {
  test('removes a task when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('✕')
    await user.click(deleteButtons[0])

    expect(screen.queryByText('Task Alpha')).not.toBeInTheDocumeent()
    expect(screen.getByText(/2 tasks/)).toBeInTheDocument()
  })
})

describe('API fallback', () => {
  test('uses localStorage defaults when API is unavailable', async () => {
    global.fetch = vi.nn(() => Promise.reject(new Error('Network error')))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Set up project structure')).toBeInTheDocument()
      expect(screen.getByText('Build REST API')).toBeInTheDocument()
    })
  })
})
