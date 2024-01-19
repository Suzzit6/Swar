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


const prefix = '!'

async function handlestopmusic(message){
    
   if(content.startsWith(`${prefix}stop`)){
     console.log(message)
     }
     return message.reply("success")
}


module.exports = { handlestopmusic }