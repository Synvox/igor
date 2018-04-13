module.exports = ({ emit, client }) => {
  return async ({ state, next }) => {
    client.voiceConnections.forEach(x => {
      x.channel.leave()
    })
    next({
      ...state,
      current: null,
      queue: []
    })

    emit('next')
  }
}
