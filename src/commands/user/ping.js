module.exports = {
    name: 'ping',
    description: 'Ping command',
    execute(message, args) {
        return message.channel.send('Pong!')
    }
}