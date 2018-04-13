require('dotenv').config()
const Discord = require('discord.js')
const youtube = require('ytdl-core')
const { get } = require('axios')
const client = new Discord.Client()

const YT_KEY = process.env.YT_KEY
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const search = async query => {
  const { data } = await get(
    `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(
      query
    )}&maxResults=25&part=snippet&key=${YT_KEY}`
  )
  const { items } = data
  return items.filter(x => x.id.videoId).map(x => ({
    url: `https://www.youtube.com/watch?v=${x.id.videoId}`,
    name: x.snippet.title,
    img: x.snippet.thumbnails.default.url
  }))
}

const getPlaylist = async playlistId => {
  const { data } = await get(
    `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&maxResults=100&part=snippet%2CcontentDetails&key=${YT_KEY}`
  )
  const { items } = data
  return items.map(x => ({
    url: `https://www.youtube.com/watch?v=${x.contentDetails.videoId}`,
    name: x.snippet.title,
    img: x.snippet.thumbnails.default.url
  }))
}

let queue = []
let broadcast

client
  .login(DISCORD_TOKEN)
  .then(() =>
    client.voiceConnections.forEach(x => {
      x.channel.leave()
    })
  )
  .catch(console.log)

client.on('message', async message => {
  if (!message.guild) {
    message.reply(`:)`)
    return
  }

  const txt = message.content.toLocaleLowerCase()

  if (!txt.includes('igor')) return

  if (!client.voiceConnections.size) {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voiceChannel) {
      await message.member.voiceChannel.join().catch(console.log)
      message.reply('Yes master...')
    } else {
      message.reply(
        'My master... I cannot connect to any voice channels. Join one first.'
      )
    }
  }

  if (txt.includes('play')) {
    const query = message.content
      .replace(/igor/gi, '')
      .replace(/play/gi, '')
      .trim()

    const appened = txt.includes('://') ? [query] : await search(query)

    queue = appened
    if (broadcast) {
      broadcast.end()
      broadcast = null
    }

    play(message)
    printQueue(x => message.reply(x))
  } else if (txt.includes('playlist')) {
    const query = message.content
      .replace(/igor/gi, '')
      .replace(/playlist/gi, '')
      .trim()

    const appended = await search(query)

    queue = [...queue, ...appened]
    printQueue(x => message.reply(x))
    play(message)
  } else if (txt.includes('list')) {
    if (queue.length === 0) {
      message.reply('Queue empty.')
    } else {
      printQueue(x => message.reply(x))
    }
  } else if (txt.includes('skip')) {
    if (broadcast) {
      broadcast.end()
    } else {
      message.reply('Nothing is playing')
    }
  } else if (txt.includes('kill')) {
    queue = []
    if (broadcast) {
      broadcast.end()
    }
    client.voiceConnections.forEach(x => {
      x.channel.leave()
    })
    message.reply('It is done.')
  }
})

process.on('SIGTERM', () => {
  client.voiceConnections.forEach(x => {
    x.channel.leave()
  })
})

function printQueue(print) {
  print(
    'Up next: \n' +
      queue.map((x, index) => `${index + 1}. ${x.name || x}`).join('\n')
  )
}

function play(message) {
  if (broadcast) return
  client.broadcasts.forEach(x => x.destroy())
  broadcast = client.createVoiceBroadcast()
  const url = queue[0]

  if (!url) return
  queue = queue.slice(1)
  console.log(url)

  const stream = youtube(url.url || url, { audioonly: true })
  broadcast.playStream(stream)

  for (const connection of client.voiceConnections.values()) {
    connection.playBroadcast(broadcast)
  }

  message.reply(`Yes master... it is playing.\n${url.name}`)

  broadcast.on('end', () => {
    if (broadcast) {
      broadcast.end()
      broadcast.destroy()
      broadcast = null
      play(message)
    }
  })
  broadcast.on('error', console.log)
}
