
module.exports = async function buildCommand(config) {

  const { appConfig, getTaskAction } = config
  const { build: tasks = [] } = appConfig

  if (!tasks.length) throw 'No build tasks found'

  console.log('Build (production mode)\n')

  const buildPromises = tasks.map(task =>
    getTaskAction(task.task)({ ...config, task })
  )

  await Promise.all(buildPromises)
}
