module.exports = ({ client }) => {
  return async ({ next }) => {
    client.voiceConnections.forEach(x => {
      x.channel.leave()
    })

    next({
      voice: null,
      current: null,
      queue: []
    })
  }
}
