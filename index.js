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
const token = process.env.DISCORD_TOKEN

const { handleplaymusic ,
     handlestopmusic , 
    handlepausemusic, 
    handleResumemusic,
     } = require("./commands/ppr");

const prefix = '!'
 
client.on("messageCreate", handleplaymusic)
client.on("messageCreate", handlestopmusic) 
client.on("messageCreate", handlepausemusic)
client.on("messageCreate", handleResumemusic)


client.login(token) 