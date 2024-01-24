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

const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

const queues = new Map()
let connections = new Map()
let streams = new Map()
let players = new Map()

const prefix = '!'

let guildId;
let connection;
let currentMessage;
let serverId;
let queue;

async function handleplaymusic(message){
    serverId = message.guild.id;
    let player = players.get(serverId)
     if(!player){
        player = createAudioPlayer()
        players.set(serverId,player)
     }
    currentMessage = message;
    const content = message.content.toLowerCase() + " song"

    if(content.startsWith(`${prefix}play`)){
     const name = content.split(`${prefix}play`)[1].trim()
     const voicechannel = message.member.voice.channel 
     if(!voicechannel){
        return message.reply("You need to join the voice channel first")
     }
     connection = connections.get(serverId)
     if(!connection){
        connection = joinVoiceChannel({
            channelId:voicechannel.id,
            guildId:voicechannel.guild.id,
            adapterCreator: voicechannel.guild.voiceAdapterCreator
        })
        connections.set(serverId,connection)
     }
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
    queue = queues.get(serverId)
    console.log(queue)
    console.log("before creating")
    if(!queue){
        queue = []
        queues.set(serverId,queue)
    }
     queue.push(searchResults.items[0])
     console.log("after creating")
     console.log(queue)
     
 
    } catch (error) {
     console.log(error)
      return message.reply("Could not find the song try adding artist name after song name")
    }
     
    if(player.state.status != AudioPlayerStatus.Playing){
        queue.splice(0, 1);
        console.log(queue)
     try {
     const stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
     
     const resource = createAudioResource(stream)
     
     const dispatcher =  player.play(resource)
     
     connection.subscribe(player); 
     
     player.on(AudioPlayerStatus.Idle, async ()=>{
        console.log("player Idle")
               await handleQueue(currentMessage)
            })
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
        serverId = currentMessage.guild.id;
        let Videourl;
        let songName;
        let queue = queues.get(serverId)
        console.log(queue)
        console.log("Unshifted this is ")
        try {
           
       const nextSong = await queue.shift()
       console.log(`nextSong : ${nextSong}`)
       console.log(queue)
       console.log("shifted this is ")

       Videourl = nextSong.url
       songName = nextSong.title
       console.log( `nextSong.url  : ${nextSong.url } \n nextSong.title  : ${nextSong.title} `)
    
        } catch (error) {
         console.log(error)
         return currentMessage.channel.send("No Songs left in queue")
        }
        let player = players.get(serverId)
        try {
            let stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
            const resource = createAudioResource(stream)
            const dispatcher =  player.play(resource)
            connection = connections.get(serverId);

            connection.subscribe(player);

            } catch (error) {
                console.log(error)
                
                return currentMessage.reply(`Error Playing the Song`) 
                 
            }
            return currentMessage.channel.send(`Now Playing ${songName}`)
           }

async function handlestopmusic(message){
    
    let player = players.get(serverId)
    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}stop`)){
      if(player){
        player.stop()
      }
      return message.reply("Player Stopped")
      }
 }
async function handlepausemusic(message){
    let player = players.get(serverId)

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}pause`)){
        if(player){
            player.pause()
          }
          return message.reply("Player Paused")
 
      }
 }
async function handleResumemusic(message){
    let player = players.get(serverId)
    
    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}resume`)){
        if(player){
            player.unpause() 
          }
       
 
      return message.reply("Player Resumed")
      }
 }

module.exports = { 
    handleplaymusic ,
    handlestopmusic ,
    handlepausemusic, 
    handleResumemusic,
    handleQueue
}