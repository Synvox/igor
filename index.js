require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const handlers = require('./handlers')

function start() {
  let channel = null
  let state = {
    current: null,
    queue: []
  }

  const messageStack = []
  let running = false

  const emit = (name, payload) => {
    messageStack.unshift({ name, payload })
    run()
  }

  const say = (...args) => Boolean(channel) && channel.send(...args)

  const run = async () => {
    if (running || messageStack.length === 0) return
    running = true
    let msg = messageStack.pop()
    while (msg) {
      let { name, payload } = msg

      // console.log('Running', name, payload, state)
      if (!fns[name]) throw new Error(`Cannot run hook for ${name}`)
      await fns[name](payload).catch(console.log)

      msg = messageStack.pop()
    }
    running = false
  }

  const fns = Object.entries(handlers)
    .map(([name, fn]) => [name, fn({ emit, client, say })])
    .map(([name, fn]) => [
      name,
      async payload => await fn({ state, payload, next: s => (state = s) })
    ])
    .reduce((obj, [name, fn]) => Object.assign(obj, { [name]: fn }), {})

  client.on('message', m => {
    channel = m.channel
    emit('message', m)
  })
}

client.login(process.env.DISCORD_TOKEN).catch(console.log)

// In the future we'll be able to pass a server in
// so there can be multiple instances.
start()
