module.exports = ({ emit }) => {
  return async ({ state, payload, next }) => {
    next({
      ...state,
      queue: payload
    })

    emit('play')
  }
}
