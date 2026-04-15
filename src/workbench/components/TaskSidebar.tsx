import { useMemo } from 'react'
import { useWorkbenchStore } from '../store/useWorkbenchStore'

export const TaskSidebar = () => {
  const tasks = useWorkbenchStore((state) => state.tasks)
  const activeTaskId = useWorkbenchStore((state) => state.activeTaskId)
  const taskSearch = useWorkbenchStore((state) => state.taskSearch)
  const setTaskSearch = useWorkbenchStore((state) => state.setTaskSearch)
  const selectTask = useWorkbenchStore((state) => state.selectTask)
  const addTask = useWorkbenchStore((state) => state.addTask)

  const visibleTasks = useMemo(() => {
    const query = taskSearch.trim().toLowerCase()
    if (!query) {
      return tasks
    }

    return tasks.filter((task) => task.name.toLowerCase().includes(query))
  }, [taskSearch, tasks])

  return (
    <aside className="task-sidebar">
      <header className="sidebar-header">
        <h1>任务栏</h1>
        <button type="button" onClick={addTask}>
          新建任务
        </button>
      </header>

      <label className="search-label">
        <span>查找任务</span>
        <input
          value={taskSearch}
          onChange={(event) => setTaskSearch(event.target.value)}
          placeholder="输入任务名..."
        />
      </label>

      <ul className="task-list">
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <button
              className={task.id === activeTaskId ? 'active' : ''}
              type="button"
              onClick={() => selectTask(task.id)}
            >
              <span>{task.name}</span>
              <small>{task.nodes.length} 组件</small>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
