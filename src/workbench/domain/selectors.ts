import type {
  AgentHistory,
  AgentNode,
  DataCellNode,
  TaskModel,
} from './types'

type TaskScope = {
  tasks: TaskModel[]
  activeTaskId: string
}

export const replaceActiveTask = (
  tasks: TaskModel[],
  activeTaskId: string,
  nextTask: TaskModel,
) => tasks.map((task) => (task.id === activeTaskId ? nextTask : task))

export const findActiveTask = (scope: TaskScope) =>
  scope.tasks.find((task) => task.id === scope.activeTaskId)!

export const findDataCell = (task: TaskModel, nodeId: string) =>
  task.nodes.find((node) => node.id === nodeId && node.type === 'dataCell') as DataCellNode

export const findAgentNode = (task: TaskModel, nodeId: string) =>
  task.nodes.find((node) => node.id === nodeId && node.type === 'agent') as AgentNode

export const findHistory = (task: TaskModel, agentId: string): AgentHistory => {
  const runtime = task.agentStates[agentId]
  return runtime.histories.find((history) => history.id === runtime.activeHistoryId)!
}
