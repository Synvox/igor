module.exports = ({ say }) => {
  return async ({ state }) => {
    const { current, queue } = state

    say({
      embed: {
        title: current.name || current,
        thumbnail: {
          url: current.url
        },
        fields: [
          {
            name: 'In Queue',
            value: queue
              .map(
                (item, index) =>
                  `\`${`${index + 1}`.padStart(3)}. ${item.name || item}\``
              )
              .join('\n')
              .substring(0, 1000)
          }
        ]
      }
    })
  }
}
