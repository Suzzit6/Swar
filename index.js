const express = require("express")
const app = express()
const fs = require("fs")
require('dotenv').config();


const { Client, GatewayIntentBits, messageLink } = require ('discord.js');
const client = new Client({ intents: 
    [ GatewayIntentBits.Guilds ,
     GatewayIntentBits.GuildMessages ,
     GatewayIntentBits.GuildIntegrations,
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.GuildVoiceStates 
     ]
}); 
const {AudioPlayerStatus,createAudioPlayer  } = require('@discordjs/voice');
const token = process.env.DISCORD_TOKEN

const { handleplaymusic ,
     handlestopmusic , 
    handlepausemusic, 
    handleResumemusic,
    handleQueue} = require("./commands/ppr");
const { error } = require("console");

const prefix = '!'
 
client.on("messageCreate", handleplaymusic)
client.on("messageCreate", handlestopmusic) 
client.on("messageCreate", handlepausemusic)
client.on("messageCreate", handleResumemusic)




client.login(token) 