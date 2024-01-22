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
let connection;
let currentMessage;

async function handleplaymusic(message){
    currentMessage = message;
    // if(isPlaying) return message.reply("A song is already Playing, Your song is queued")
    const content = message.content.toLowerCase() + " song"

    if(content.startsWith(`${prefix}play`)){
     const name = content.split(`${prefix}play`)[1].trim()
     const voicechannel = message.member.voice.channel 
     if(!voicechannel){
        return message.reply("You need to join the voice channel first")
     }
 
     connection = joinVoiceChannel({
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
 
     queue.push(searchResults.items[0])
     console.log( queue)
 
    } catch (error) {
     console.log(error)
      return message.reply("Could not find the song try adding artist name after song name")
    }
     
    if(player.state.status != AudioPlayerStatus.Playing){
        queue.splice(0, 1);
     try {
     const stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
     
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
     else{
        return message.reply(`${songName} has been queued`)
     }
   }
} 




async function handleQueue(currentMessage){
    
        let Videourl;
        let songName;
        try {
        const nextSong = await queue.shift()
        console.log(`nextSong : ${nextSong}`)

       Videourl = nextSong.url
       songName = nextSong.title
       console.log( `nextSong.url  : ${nextSong.url } \n nextSong.title  : ${nextSong.title} `)
    
        } catch (error) {
         console.log(error)
         return currentMessage.channel.send("No Songs left in queue")
        }
     
        try {
            const stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
            
            const resource = createAudioResource(stream)
            const dispatcher =  player.play(resource)
            
            connection.subscribe(player);

            } catch (error) {
                console.log(error)
                
                return currentMessage.reply(`Error Playing the Song`) 
                 
            }
            return currentMessage.channel.send(`Now Playing ${songName}`)
           }

player.on(AudioPlayerStatus.Idle, async ()=>{
            handleQueue(currentMessage)
        })

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
 