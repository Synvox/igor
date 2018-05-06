module.exports = ({ emit }) => {
  return async ({ payload, next }) => {
    next({
      queue: payload
    })

    emit('play')
  }
}
