const { get } = require('axios')

const search = async query => {
  const { data } = await get(
    `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(
      query
    )}&maxResults=25&part=snippet&key=${process.env.YT_KEY}`
  )
  const { items } = data
  return items.filter(x => x.id.videoId).map(x => ({
    url: `https://www.youtube.com/watch?v=${x.id.videoId}`,
    name: x.snippet.title,
    img: x.snippet.thumbnails.default.url
  }))
}

module.exports = ({ emit, client }) => {
  return async ({ payload: message }) => {
    if (!message.content.match(/igor/i)) return
    if (message.content.match(/clear|kill/i)) return emit('clear')
    if (message.content.match(/next|skip/i)) return emit('play')
    if (message.content.match(/shuffle/i)) return emit('shuffle')
    if (!message.content.match(/play/i)) {
      message.channel.send({
        content: 'Yes master...',
        embed: {
          fields: [
            {
              name: 'igor play [search|url]',
              value: 'Search youtube or play a youtube url'
            },
            {
              name: 'igor skip, igor next',
              value: 'Skips the current track'
            },
            {
              name: 'igor kill, igor clear',
              value: 'Removes igor from the voice channel'
            }
          ]
        }
      })
      return
    }

    if (!client.voiceConnections.size) {
      if (message.member.voiceChannel) {
        await message.member.voiceChannel.join().catch(console.log)
      } else {
        message.channel.send(
          'My master... I cannot connect to any voice channels. Join one first.'
        )
      }
    }

    const query = message.content
      .replace(/igor/gi, '')
      .replace(/play/gi, '')
      .trim()

    const items = await search(query)

    emit('append', items)
  }
}
