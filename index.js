const express = require("express")
const app = express()
const fs = require("fs")
require('dotenv').config();
const port = 4546;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

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
     handleskipmusic, 
    handlepausemusic, 
    handleResumemusic,
    handleHelp,
    handleSeeQueue,
    handleDonate,
    handleInviteBot,
    handleInviteAdmin
     } = require("./commands/ppr");
const { channel } = require("diagnostics_channel");

const prefix = '='

client.on('guildCreate', async guild => {
     try {
          const Djrole = guild.roles.cache.find(role => role.name == "Mewsic DJ")
          if(!Djrole){
               await guild.roles.create({
                    name: 'Mewsic DJ',
                    reason: "Don't Mess with this role or don't Change name etc of this role !!"
               })
          }
     } catch (error) {
         console.error('Error creating role:', error)
     }
 })
 

client.on("messageCreate", handleplaymusic)
client.on("messageCreate", handlestopmusic) // for those who wondering i shouldve wrote all the handle commmands on one client.on, i tried that way but it didnt worked.
client.on("messageCreate", handleskipmusic) 
client.on("messageCreate", handlepausemusic) 
client.on("messageCreate", handleResumemusic)
client.on("messageCreate", handleHelp)
client.on("messageCreate", handleSeeQueue)
client.on("messageCreate", handleDonate)
client.on("messageCreate", handleInviteBot)
client.on("messageCreate", handleInviteAdmin)


client.login(token) 

app.listen(port, () => {
     console.log(`Example app listening on port ${port}`)
   })