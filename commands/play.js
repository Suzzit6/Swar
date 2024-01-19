const express = require("express")
const app = express()

const { Client, GatewayIntentBits, messageLink, Message } = require ('discord.js');
const client = new Client({ intents: 
    [ GatewayIntentBits.Guilds ,
     GatewayIntentBits.GuildMessages ,
     GatewayIntentBits.GuildIntegrations,
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.GuildVoiceStates,
     ] 
});
const { joinVoiceChannel,createAudioPlayer ,createAudioResource  } = require('@discordjs/voice');

const player = createAudioPlayer()
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
// const ytdl = require('youtube-dl-exec')


const prefix = '!'

async function handleplaymusic(message){

   const content = message.content.toLowerCase() + " song"
   if(content.startsWith(`${prefix}play`)){
    const name = content.split(`${prefix}play`)[1].trim() 
    console.log(name)
    const voicechannel = message.member.voice.channel
    if(!voicechannel){
        return message.reply("You need to join the voice channel first")
    }
    const connection = joinVoiceChannel({
        channelId:voicechannel.id,
        guildId:voicechannel.guild.id,
        adapterCreator: voicechannel.guild.voiceAdapterCreator
    })
    const options = {
          pages: 1,
        }

    try {
    const searchResults = await ytsr(name,options)
    console.log(searchResults.items[0].url)
    const url = searchResults.items[0].url
    const songName = searchResults.items[0].title
    console.log(songName)

    } catch (error) {
        return message.reply(`Could not find the song, try adding the artist name`)
    }
    try {
    const stream = ytdl(url, { filter: "audioonly",  highWaterMark: 1<<25  })
    console.log("stream" + stream)
    
    const resource = createAudioResource(stream)
    const dispatcher =  player.play(resource)
    
    console.log("dispatcher" + dispatcher)
    connection.subscribe(player);
    } catch (error) {
        return message.reply(`Error Playing the Song`)
    }
    return message.reply(`Now Playing ${songName}`)
   }
}

module.exports = { handleplaymusic }
 