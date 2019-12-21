const { execSync } = require('child_process')

const run = (cmd, options = {}) => {

  const {
    silent = false,
    capture = false,
    cwd = process.cwd()
  } = options

  if (!silent && !capture) console.log(cmd)

  try {
    const result = capture
      ? execSync(cmd, { stdio: 'pipe', cwd }).toString()
      : execSync(cmd, { stdio: 'inherit', cwd })

    if (capture) return result
    if (result) console.log(result)

  } catch(e) {
    if (capture) return e.message
    if (!silent) console.error(e.message)
  }
}

module.exports = run