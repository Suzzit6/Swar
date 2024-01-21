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
const { joinVoiceChannel,createAudioPlayer ,createAudioResource ,AudioPlayerStatus  } = require('@discordjs/voice');

const player = createAudioPlayer()
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

const prefix = '!'
const queue = []

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

   let Videourl;
   let songName;
   try {
    const searchResults = await ytsr(name,options)
    if(!searchResults) return message.reply("Unable to find the song on Youtube database")

    Videourl = searchResults.items[0].url
    songName = searchResults.items[0].title

    player.on(AudioPlayerStatus.Playing,()=>{
        
        if(content.startsWith(`${prefix}play`)){
            queue.push(searchResults.items[0])
            return message.reply("Song Queued")
        }
    
    })
        
    queue.push(searchResults.items[0])
    console.log(queue)
    console.log(songName)

   } catch (error) {
    console.log(error)
     return message.reply("Could not find the song try adding artist name after song name")
   }
    
    try {
    const stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
    console.log("stream" + stream)
    
    const resource = createAudioResource(stream)
    const dispatcher =  player.play(resource)
    
    console.log("dispatcher" + dispatcher)
    connection.subscribe(player);
    } catch (error) {
        console.log(error)
        return message.reply(`Error Playing the Song`)
        
    }
    return message.reply(`Now Playing ${songName}`)
   }
}

function getNextResource(){
    const nextUrl = queue.shift()
    console.log(nextUrl)
    return nextUrl
}
async function handleQueue(message){
        let Videourl;
        let songName;
        try {
       const nextSong = getNextResource()
       console.log(nextSong+"nextsong")
       Videourl = nextSong.url
       songName = nextSong.title
    
        } catch (error) {
            console.log(error)
         return message.reply("Could not find the song try adding artist name after song name")
        }
    
        try {
            const stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
            console.log("stream" + stream)
            
            const resource = createAudioResource(stream)
            const dispatcher =  player.play(resource)
            
            console.log("dispatcher" + dispatcher)
            connection.subscribe(player);
            } catch (error) {
                console.log(error)
                return message.reply(`Error Playing the Song`)
                
            }
            return message.reply(`Now Playing ${songName}`)
           }

async function handlestopmusic(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}stop`)){
 
      player.stop()
 
      return message.reply("Player Stopped")
      }
 }
async function handlepausemusic(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}pause`)){
 
      player.pause()
 
      return message.reply("Player Paused")
      }
 }
async function handleResumemusic(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}resume`)){
 
        player.unpause()
 
      return message.reply("Player Resumed")
      }
 }

 player.on('error', error => {
	console.error(error);
	player.play(getNextResource());
});

module.exports = { 
    handleplaymusic ,
    handlestopmusic ,
    handlepausemusic, 
    handleResumemusic,
    handleQueue
}
 