module.exports = ({ say }) => {
  return async ({ state }) => {
    const { current, queue } = state

    say({
      embed: {
        title: current.name || current,
        thumbnail: {
          url: current.img
        },
        fields: [
          {
            name: 'In Queue:',
            value: queue
              .slice(0, Math.min(queue.length, 10))
              .map(
                (item, index) =>
                  `\`${String(index + 1).padStart(3)}. ${item.name || item}\``
              )
              .join('\n')
              .substring(0, 1000)
          }
        ]
      }
    })
  }
}
