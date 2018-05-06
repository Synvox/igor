require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const handlers = require('./handlers')

function start(message) {
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
      async payload => await fn({ state, payload, next: s => (state = Object.assign(state, s)) })
    ])
    .reduce((obj, [name, fn]) => Object.assign(obj, { [name]: fn }), {})

  channel = message.channel
  emit('message', message)
}

client.login(process.env.DISCORD_TOKEN).catch(console.log)

client.on('message', m => {
  start(m)
})
