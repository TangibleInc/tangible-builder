const createConfig = require('./config')

;(async () => {

  const config = await createConfig()
  const { command } = config

  await require(`./commands/${command}`)(config)

})().catch(e => e && console.error(e))
