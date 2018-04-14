module.exports = () => {
  return async ({ state }) => {
    if (state.broadcast) state.broadcast.resume()
  }
}
