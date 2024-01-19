const express = require("express")
const app = express()

const { Client, GatewayIntentBits, messageLink } = require ('discord.js');
const client = new Client({ intents: 
    [ GatewayIntentBits.Guilds ,
     GatewayIntentBits.GuildMessages ,
     GatewayIntentBits.GuildIntegrations,
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.GuildVoiceStates
     ] 
});
const token = "MTE5NjQ1NzY2OTkxODIwMzkxNQ.Go2bMQ.egz89Gwvr1dEJC-MoPMLbp_imhamIFGL6gBOdA"
const { handleplaymusic } = require("./commands/play")
const { handlestopmusic } = require("./commands/stop")
const prefix = '!'

client.on("messageCreate", handleplaymusic , handlestopmusic)

client.login(token)