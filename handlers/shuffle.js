module.exports = ({ emit }) => {
  return async ({ state, next }) => {
    let arr1 = [state.current, ...state.queue].filter(x => x)
    let arr2 = []

    while (arr1.length) {
      let index1 = Math.floor(Math.random() * arr1.length)
      let index2 = Math.floor(Math.random() * arr2.length + 1)
      arr2.splice(index2, 0, arr1[index1])
      arr1.splice(index1, 1)
    }

    next({
      current: null,
      queue: arr2
    })

    emit('play')
  }
}
