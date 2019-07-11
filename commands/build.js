
module.exports = async function buildCommand(config) {

  const { appConfig, getTaskAction } = config
  const { build: tasks = [] } = appConfig

  if (!tasks.length) throw 'No build tasks found'

  console.log('Build for production\n')

  const runTaskAction = task => getTaskAction(task.task)({
    ...config, task
  })

  try {
    await Promise.all(tasks.map(runTaskAction))
  } catch(e) { /**/ }
}
