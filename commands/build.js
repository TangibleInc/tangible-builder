
module.exports = async function buildCommand(config) {

  const { appConfig, getTaskAction } = config
  const { build: tasks = [], serve } = appConfig

  if (!tasks.length && !serve) throw 'No build tasks found'

  console.log('Build for production\n')

  const runTaskAction = task => getTaskAction(task.task)({
    ...config, task
  })

  try {
    await Promise.all(tasks.map(runTaskAction))
  } catch(e) {
    throw e
  }

  if (serve) require('../tasks/serve')({ ...config, task: serve, build: true })
}
