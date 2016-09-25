const Discord = require('discord.js');
var log = require("./log.js");
var client = new Discord.Client();
var char = "!";
var owner = "YOUR_ID_HERE";
var fs = require("fs");
var owner_obj = {};
var starts = 0;
var client_id = "";
var loginToken = "TOKEN";
fs.readFile("./token.json", function(error, data) {
    if (error) {
        console.log(error);
        log.error("Login Token File Missing");
        log.error("to fix do npm token your_token_here");
        process.exit(1);
    }
    loginToken = JSON.parse(data).token;
    client.login(loginToken).then(output);
}); 

const ytdl = require('ytdl-core');
const streamOptions = {
    seek: 0,
    volume: 1
};


//I suggest removing these later...
process.on('unhandledRejection', (reason, p) => {
    if (owner_obj.hasOwnProperty("status")) {
        owner_obj.sendMessage(
            "Promise error, Promise: " + JSON.stringify(p, null, 4) + ", error: " + reason
        );
    }
    log.error("Promise error, Promise: " + p + ", error: " + reason);
});
process.on('uncaughtException', function(err) {
    if (owner_obj.hasOwnProperty("status")) {
        owner_obj.sendMessage(
            "Caught Error: \n" +
            err
        );
    }
    log.error("caught error: \n" + err.stack);
});


client.on("error", function() {
    log.error("Disconnected at " + new Date() + " :(");
    process.exit(1);
});
client.on('message', function(message) {
    //fs.writeFile("./messages/" + message.id + "message.json", JSON.stringify(message, null, 4));
    /*if (message.content.indexOf(char) == 0) message.delete(1000);
    if (message.author == client.user) {
        if (!message.guild) {
            return;
        }
        else {
            message.delete(3000);
            return
        }
    }*/
    if (message.content.indexOf(char) == -1) return;
    try {
        var msg = {};
        msg.a = message.content;
        msg.p = message.author;
        msg.ch = message.channel;
        var args = msg.a.split(" ");
        var cmd = args[0].toLowerCase();
        //private messages only read if owner
        if (message.author.id === client.user.id) return;
        if (msg.p.id == owner) {
            /*if (cmd == char + "js") {
                try {
                    msg.p.sendMessage("Console: " + eval(args.splice(1).join(" ")));
                }
                catch (err) {
                    msg.p.sendMessage("Error: " + err.message + "\n" + err.stack);
                }
            }*/
            if (cmd == char + "err") {
                /*global a z*/
                return a + z;
            }
            if (msg.a == char + "shutdown") {
                client.user.setStatus("away", "shutting down...");
                log.info("Shutdown at " + new Date() + " :(");
                client.destroy().then(() => {
                    process.exit(1);
                });
            }
        }

        if (cmd == char) { //sends username
            msg.ch.sendMessage("yo wassup <@" + msg.p.id + ">");
        }
        if (cmd == char + "help") { //helplist
            msg.p.sendMessage(
                "`!join` | Connects bot to your connected voice channel.\n" +
                "`!p-yt` _youtube link_ | plays a song. \n" +
                "`!stop` | stops the current song and leaves the Voice Channel. \n" +
                "`!vol [0-100]` | changes the volume of the bot \n");
        }
        if (cmd == char + "ban") {
            var guildUser = message.guild.member(message.mentions.users.first());
            message.delete();
            message.channel.sendMessage(":x:" + guildUser.user.username + " Has Detention :x:");
            guildUser.addRole(message.guild.roles.find("name", "Banned").id);
        }
        if (cmd == char + "unban") {
            var guildUser = message.guild.member(message.mentions.users.first());
            message.delete();

            message.channel.sendMessage(":heavy_check_mark: User " +
                guildUser.user.username + " was let out of detention early :heavy_check_mark:");

            guildUser.removeRole(message.guild.roles.find("name", "Banned").id);
        }

        //Voice Channel Commands
        var VoiceChannel = client.channels.get(message.member.voiceChannelID);
        var _connectable = message.member.voiceChannelID !== undefined;
        if (cmd == char + "join") { //joins voice channel
            if (msg.ch.type == "dm") {
                msg.p.sendMessage("You must be in a guild to do that!");
                return;
            }
            if (!_connectable) return;
            VoiceChannel.join();
        }
        if (cmd == char + "p-yt") {

            VoiceChannel.join().then((vC) => {
                console.log(args);
                const stream = ytdl(args[1], {
                    filter: 'audioonly'
                });
                const dispatcher = vC.playStream(stream, streamOptions);
            });

        }
        if (cmd == char + "stop") {
            if (!_connectable) return;
            VoiceChannel.join().then((vC) => {
                vC.disconnect();
            });
        }
        if (cmd == char + "volume" || cmd == char + "vol") { //raises or lowers the volume
            if (!_connectable) return;
            VoiceChannel.join().then((vC) => {

                if (!args[1]) {

                    msg.ch.sendMessage("setting volume to 100%");
                    vC.setVolume(1);
                    return;

                }
                var vol = parseInt(args[1], 10);
                if (vol >= 101 || 0 >= vol) { // if volume greater than 100 or if below 0
                    msg.ch.sendMessage("Volume must be between 0 and 100");
                }
                else { //no prams makes it 100
                    msg.ch.sendMessage("Setting volume to " + vol + "%");
                    vC.setVolume(vol / 100);
                }
            });
        }
    }
    catch (err) {
        if (message.author.id !== owner_obj.id) {

            message.author.sendMessage(
                "`This bot is still in devolepment`\n" +
                "The devoleper has been alerted of this error and will try to fix this ASAP.\n" +
                "_Try again later_"
            );
        }
        owner_obj.sendMessage(
            "The User " + message.author + " caused this in Guild `" + message.guild + "`" +
            " in the text Channel of " + message.channel + "\n" +
            "Information on the message can be found in `./messages/" + message.id + "message.json`\n" +
            "Message contained: `" + message.content + "`\n" +
            "Caught Error: " + err.message + "\n" + "```\n" +
            err.stack + "\n```"
        );
        log.error("err: " + err);
    }

});
client.on("ready", function() {
    starts++;
    if (starts <= 1) {
        client.fetchUser(owner).then((user) => {
            owner_obj = user;
            user.sendMessage("LightningBot Started up at " + new Date(Date.now()).toLocaleString());
            log.info("LightningBot Started at " + new Date(Date.now()).toLocaleString())
        });
        client.user.setStatus("online", "node.js");
    }
    else {
        owner_obj.sendMessage("Unknown Startup at " + new Date(Date.now()).toLocaleString() + " Startups: " + starts);
        log.warn("Unknown Startup at " + new Date(Date.now()).toLocaleString() + " Startups: " + starts);
    }
});

client.on("serverCreated", function(server) {
    client.user.sendMessage(server, "LightningBot joined!");
});

function output(token) {
    if (!token) {
        log.error('There was an error logging in');
        return;
    }
    else {
        log.info('Logged in. Token: ' + token);
        client_id = token;
        log.log("https://discordapp.com/oauth2/authorize?client_id=" + client_id + "&scope=bot&permissions=8");
    }
}
client.login(loginToken).then(output);
