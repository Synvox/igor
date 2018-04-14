module.exports = ({ client }) => {
  return async ({ state, next }) => {
    client.voiceConnections.forEach(x => {
      x.channel.leave()
    })

    next({
      ...state,
      current: null,
      queue: []
    })
  }
}
