import { TaskSidebar } from './TaskSidebar'
import { WorkbenchCanvas } from './WorkbenchCanvas'

export const WorkbenchApp = () => {
  return (
    <main className="workbench-layout">
      <TaskSidebar />
      <WorkbenchCanvas />
    </main>
  )
}
