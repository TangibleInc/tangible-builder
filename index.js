const createConfig = require('./config')

const config = createConfig()
const { command } = config

try {
  const result = require(`./commands/${command}`)(config)
  if (result && result.catch) result.catch(console.error)
} catch(e) { console.error(e) }
