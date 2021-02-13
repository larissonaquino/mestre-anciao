require('dotenv').config()
const express = require('express');
const app = express();

const roles = require('./src/ids/roles')
const channels = require('./src/ids/channels')

app.get('/', (request, response) => {
    const ping = new Date();

    ping.setHours(ping.getHours() - 3);
    console.log(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);

    response.sendStatus(200);
});

app.listen(process.env.PORT);
console.log(`Listening on ${process.env.PORT}...`);

const Discord = require("discord.js")
const client = new Discord.Client()
const config = require("./config.json")
const fs = require('fs')

client.commands = new Discord.Collection()
const adminFiles = fs.readdirSync('./src/commands/admin').filter(file => file.endsWith('.js'))
const userFiles = fs.readdirSync('./src/commands/user').filter(file => file.endsWith('.js'))

for (const file of adminFiles) {
    const command = require(`./src/commands/admin/${file}`)
    client.commands.set(command.name, command)
}

for (const file of userFiles) {
    const command = require(`./src/commands/user/${file}`)
    client.commands.set(command.name, command)
}

client.on("ready", () => {
    console.log(`I'm ready to go!`)
})

client.on("guildCreate", guild => {
    console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`)
})

client.on("guildDelete", guild => {
    console.log(`O bot foi removido do servidor ${guild.name} (id: ${guild.id})`)
    client.user.setActivity(`Serving ${client.guilds.size} servers`)
})

client.on("guildMemberAdd", member => {
    const welcomeRole = member.guild.roles.cache.get(roles.cavaleiro)
    member.roles.add(welcomeRole)

    member.send(
        `Olá ${member.user.username}, seja bem vindo ao CdZ Ultimate! Atualmente o servidor está na sua reta final de desenvolvimento. Por favor, tenha paciência, 
nosso Discord estará repleto de notícias sobre nosso server, nos acompanhe, qualquer dúvida pode chamar os ADMs no privado.`
    ).catch(console.error('error in guildMemberAdd'))
})

client.on("message", async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()

    if (!client.commands.has(commandName)) return
    const command = client.commands.get(commandName)

    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
        message.reply('Houve um problema ao executar este comando.')
    }
})

client.login(process.env.TOKEN)