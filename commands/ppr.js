const express = require("express")
const app = express()

const { Client, GatewayIntentBits, messageLink, Message , EmbedBuilder  } = require ('discord.js');
const client = new Client({ intents: 
    [ GatewayIntentBits.Guilds ,
     GatewayIntentBits.GuildMessages ,
     GatewayIntentBits.GuildIntegrations,
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.GuildVoiceStates,
     ] 
});
const { joinVoiceChannel,createAudioPlayer ,createAudioResource ,AudioPlayerStatus , getVoiceConnection ,VoiceConnectionStatus } = require('@discordjs/voice');

const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

const queues = new Map()
let connections = new Map()
let streams = new Map()
let players = new Map()

const prefix = '='

let connection;
let subscription;
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
     connection.on("stateChange", (oldState,newState)=>{
        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
        if(newState.status === 'disconnected'){
            // message.guild.me.voice.channel.leave();
            console.log('Bot has left the voice channel!');
        } 
        if(newState.status === 'disconnected' && oldState.status === 'disconnected'){
            // message.guild.me.voice.channel.leave();
            
            
            connection = joinVoiceChannel({
            channelId:voicechannel.id,
            guildId:voicechannel.guild.id,
            adapterCreator: voicechannel.guild.voiceAdapterCreator
        })
        connections.set(serverId,connection)
        } 
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
    queue = queues.get(serverId)
    if(!queue){
        queue = []
        queues.set(serverId,queue)
    }
     queue.push(searchResults.items[0])
     
 
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
     
     subscription =  connection.subscribe(player); 
     
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
        try {
           
       const nextSong = await queue.shift()

       Videourl = nextSong.url
       songName = nextSong.title
    
        } catch (error) {
         console.log(error)
         return currentMessage.channel.send("No Songs left in queue")
        }
        let player = players.get(serverId)
        try {
            let stream = ytdl(Videourl, { filter: "audioonly",  highWaterMark: 1<<25  })
            const resource = createAudioResource(stream)
            const dispatcher =  player.play(resource)
            connection = getVoiceConnection(serverId)

            subscription = connection.subscribe(player);

            } catch (error) {
                console.log(error)
                
                return currentMessage.reply(`Error Playing the Song`) 
                 
            }
            return currentMessage.channel.send(`Now Playing ${songName}`)
            
           }
           

async function handlestopmusic(message){
    
    let player = players.get(serverId)
   try {
    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}stop`)){
      if(player){
        subscription.unsubscribe()
      }
      return message.reply("Player Stopped")
      }
   } catch (error) {
    console.log(`error in handlestop ${error}`)
    return message.reply("An Unknown error occured")
   } 
 }
 
async function handleskipmusic(message){
    const Djrole = message.guild.roles.cache.find(role => role.name == "Mewsic DJ")

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}skip`)){

    if (!message.member.roles.cache.has(Djrole.id)) return message.reply("The one with the DJ role can only skip Songs")
        
        let player = players.get(serverId)
        const content = message.content.toLowerCase()
        if(content.startsWith(`${prefix}skip`)){
          if(player){
            player.stop()
          }
          return message.reply("Song Skipped")
          }
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

 async function handleHelp(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}help`)){
    const HelpInEmbed = new EmbedBuilder()
        .setTitle("Welcome To Mewsic Bot !")
        .setDescription(`Dj role has been created
        Note:Don't Mess with this role or don't Change name of this role !!`)
        .setThumbnail('https://i.imgur.com/D88uzou.jpg')
        .addFields(
            { name: `${prefix}play Song_name`,value:`Plays the Song or queues the song if already playing` },
            { name: `${prefix}pause `,value:` To pause the current song` },
            { name: `${prefix}resume `,value:`To resume the currently paused music` },
            { name: `${prefix}skip `,value:`skips to other songs in the queue` },
            { name: `${prefix}stop `,value:`Destroys the Queue and stops the player completely` },
            { name: `${prefix}queue `,value:`Lists the total number of songs in the queue` },
            { name: `${prefix}donate `,value:`Donate to Maintain the quality and hosting service of this bot` },
            { name: `${prefix}invite `,value:`Replies with Bot Official invite link` },
            { name: `${prefix}server `,value:`Replies with Bot's Official Server invite link` },
        )
        .setFooter({ text: `Created By: @suzzit911 Youtube: @c4Shots`});
      return message.reply({embeds:[HelpInEmbed]})
      }
 }
 async function handleSeeQueue(message){
    serverId = currentMessage.guild.id;
    try {
        let queue = queues.get(serverId)

        const content = message.content.toLowerCase()
        if(content.startsWith(`${prefix}queue`)){
            const titles = queue.filter(q => q.title ).map((q,index)=>`${index + 1}. ${q.title}`)
            const queue_songs = titles.join('\n')
            const QueueInEmbed = new EmbedBuilder()
            .setTitle("Queues")
            .setDescription(queue_songs) 
            console.log(QueueInEmbed)
            return message.reply ({ embeds: [QueueInEmbed] }) 
            }
    } catch (error) {
        return message.reply("Queue Empty")
    }
 }  
 async function handleDonate(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}donate`)){
        return message.reply(`Donate to Improve this Bot Quality and hosting service :) - https://www.buymeacoffee.com/c4shots `)
        }
 }
 async function handleInviteBot(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}invite`)){
        return message.reply(`Bot Invite Link : https://shorturl.at/adoU7`)
        }
    
 }
 async function handleInviteAdmin(message){

    const content = message.content.toLowerCase()
    if(content.startsWith(`${prefix}server`)){
        return message.reply(`Server Invite Link : https://discord.gg/vnw3BtaZJm`)
        }
 }


module.exports = { 
    handleplaymusic ,
    handlestopmusic ,
    handleskipmusic,
    handlepausemusic, 
    handleResumemusic,
    handleQueue,
    handleHelp,
    handleSeeQueue,
    handleDonate,
    handleInviteBot,
    handleInviteAdmin 
} 