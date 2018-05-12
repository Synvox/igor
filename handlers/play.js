const youtube = require('ytdl-core')

module.exports = ({ emit, client }) => {
  return async ({ state, next }) => {
    if (state.voiceHandler) {
      next({
        current: null,
        voiceHandler: null
      })

      setTimeout(() => {
        state.voiceHandler.end()
        emit('play')
      }, 200)

      return
    }

    const current = state.queue[0] || null
    let broadcast = null
    let stream = null
    let voiceHandler = null

    if (current) {
      broadcast = client.createVoiceBroadcast()
      stream = youtube(current.url || current, { audioonly: true })
      voiceHandler = broadcast.playStream(stream)

      for (const connection of client.voiceConnections.values()) {
        const dispatcher = connection.playBroadcast(broadcast)
        dispatcher.setVolume(0.5)
      }

      stream.on('end', () => {
        setTimeout(() => {
          emit('play')
          if (state.voiceHandler) state.voiceHandler.end()
        }, 200)
      })
    }

    next({
      current,
      voiceHandler,
      queue: state.queue.slice(1)
    })

    emit('print')
  }
}
