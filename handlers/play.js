const youtube = require('ytdl-core')

module.exports = ({ emit, client }) => {
  return async ({ state, next }) => {
    if (state.broadcast) {
      next({
        ...state,
        current: null,
        broadcast: null
      })
      state.broadcast.end()
      return
    }

    const current = state.queue[0] || null
    let broadcast = null

    if (current) {
      broadcast = client.createVoiceBroadcast()
      const stream = youtube(current.url || current, { audioonly: true })
      broadcast.playStream(stream)

      for (const connection of client.voiceConnections.values()) {
        connection.playBroadcast(broadcast)
      }

      broadcast.on('end', () => emit('play'))
    }

    next({
      ...state,
      broadcast,
      current,
      queue: state.queue.slice(1)
    })

    emit('print')
  }
}
