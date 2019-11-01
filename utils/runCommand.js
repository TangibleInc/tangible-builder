const { execSync } = require('child_process')

const run = (cmd, options = {}) => {

  const {
    silent = false,
    capture = false
  } = options

  if (!silent && !capture) console.log(cmd)

  try {
    const result = capture
      ? execSync(cmd, { stdio: 'pipe' }).toString()
      : execSync(cmd, { stdio: 'inherit' })

    if (capture) return result
    if (result) console.log(result)

  } catch(e) {
    if (capture) return e.message
    if (!silent) console.error(e.message)
  }
}

module.exports = run