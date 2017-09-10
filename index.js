//Tokens and Logins
var loginToken = "";
var ytApiToken = "";
var pandoraLogin = ["email@email.com", "password1234"];
//Libraries
const Discord = require('discord.js');
const YouTube = require('youtube-node');
const log = require("./log.js");
const ytdl = require('ytdl-core'); //youtube download - playing songs
//const Anesidora = require("anesidora"); //pandora lib
const fs = require("fs");
var client = new Discord.Client();
var pandora; //still not used, yet.
var youTube; //youtube search - uses api key.
var char = "!"; //default prefix;
var starts = 0;
var stops = 0;
var color = 16565012; //0xFCC314
var client_id = "";
var owner;
var guilds = {}; //stores settings
var cmds = {
    help: help,
    connect: connect,
    searchyoutube: searchyoutube,
    volume: volume,
    prefix: prefix,
    alias: alias,
    playyoutube: playyoutube,
    role: role,
    purge: purge
};
var motd = " | A flavor of ShockBot";
//https://meowbin.com/pastes?id=f828hfe0f2&raw
function GuildSettings() {
    this.char = "!";
    this.msgChannel = undefined;
    this.voiceChannel = undefined;
    this.access = {}; //0 is least powerful, highest is most powerful.
    this.cmds = {
        help: {
            alias: ["h"],
            access: 0
        },
        connect: {
            alias: ["join"],
            access: 0
        },
        searchyoutube: {
            alias: ["yt-s"],
            access: 0
        },
        volume: {
            alias: ["vol"],
            access: 0
        },
        prefix: {
            alias: [],
            access: 1
        },
        alias: {
            alias: [],
            access: 0
        },
        playyoutube: {
            alias: ["yt-p"],
            access: 0
        },
        role: {
            alias: [],
            access: 1
        },
        purge: {
            alias: [],
            access: 1
        }
    };
    return this;
}
const streamOptions = {
    seek: 0,
    volume: 1
};
//if (!(pandoraLogin == ["email@email.com", "password1234"]) && pandoraLogin) {
//    pandora = new Anesidora(pandoraLogin[0], pandoraLogin[1]);
//}
if (ytApiToken !== "TOKEN") {
    youTube = new YouTube();
    youTube.setKey(ytApiToken);
}
client.on("error", function() {
    log.error("Disconnected at " + new Date() + " :(");
    process.exit(1);
});

function connect(msg) {
    var args = msg.content.split(" ");
    var text = args.slice(1).join(" ");
    var _connectable = msg.member ? msg.member.voiceChannelID : undefined;
    if (_connectable) {
        var VoiceChannel = client.channels.get(_connectable).join();
        msg.react("📥");
    }
};

function help(msg) {
    var p = guilds[msg.guild.id].char;
    var desc = `\`\`\`\n${p}join | Connects to your voice channel.\n${p}stop | Disconnects from voice channel.\n${p}vol [0-100] | Controls the volume of the current song.\n\`\`\``;
    var embed = {
        title: "Help",
        "description": desc,
        "color": color,
        "footer": {
            "icon_url": client.user.avatarURL,
            "text": "!help | A Flavor of ShockBot"
        },
        "author": {
            name: msg.guild.me.nickname || client.username,
            icon_url: client.user.avatarURL
        },
    };
    msg.author.send({
        embed
    }).then(message => {
        message.react("⚡");
    });
}

function searchyoutube(msg) {
    log.info("Command Search YouTube");
    var args = msg.content.split(" ");
    var text = args.slice(1).join(" ");
    var _connectable = msg.member ? msg.member.voiceChannelID : undefined;
    if (_connectable) {
        var VoiceChannel = client.channels.get(msg.member.voiceChannelID);
    }
    if (text === "") {
        msg.channel.sendMessage("`!yt-search` requires arguments, see `!help`");
    }
    else if (VoiceChannel) {
        youTube.search(text, 1, {
            type: "video"
        }, function(error, result) {
            if (error) {
                msg.channel.send("No results found for " + text);
            }
            else {
                msg.channel.send("Found Video: <https://youtube.com/watch?v=" + result.items[0].id.videoId + ">");
                if (!_connectable) return;
                const stream = ytdl(result.items[0].id.videoId, {
                    filter: 'audioonly'
                });
                VoiceChannel.join().then(vC => {
                    msg.guild.voiceConnection.dispatcher = vC.playStream(stream, streamOptions);
                });
            }
        });
    }
    else {
        youTube.search(text, 5, {
            type: "video"
        }, function(error, result) {
            if (error) {
                msg.channel.send("No results found for " + text);
            }
            else {
                var embed = new Discord.RichEmbed({
                    title: "YouTube Search Result",
                    color: color
                });
                embed.setAuthor(client.user.username, client.user.avatarURL)
                    .setFooter(guilds[msg.guild.id].char + msg.cmd + " " + text + " | A flavor of ShockBot", client.user.avatarURL);
                var resultStr;
                for (var i in result.items) {
                    resultStr += "\n**" + result.items[i].snippet.title + "**: <https://youtu.be/" + result.items[i].id.videoId + "/>";
                }
                embed.setDescription(resultStr);
                msg.channel.send({
                    embed
                });
            }
        });
    }
}

function volume(msg) {
    log.log("Volume command");
    var args = msg.content.split(" ");
    var text = args.slice(1).join(" ");
    var vC = msg.guild.voiceConnection;
    if (!vC || !vC.dispatcher) {
        msg.channel.send("No song is playing.");
        return;
    }
    if (!args[1]) {
        msg.channel.send("Setting volume to 100%");
        vC.dispatcher.setVolume(1);
        return;
    }
    var vol = parseInt(args[1], 10);
    if (vol >= 101 || 0 >= vol) { // if volume greater than 100 or if below 0
        msg.channel.sendMessage("Volume must be between 0 and 100");
    }
    else { //no prams makes it 100
        msg.channel.sendMessage("Setting volume to " + vol + "%");
        vC.dispatcher.setVolume(vol / 100);
    }
}

function prefix(msg) {
    var args = msg.content.split(" ");
    if (!args[1]) {
        msg.channel.send("The current prefix for this server is " + guilds[msg.guild.id].char);
    }
    else {
        if (msg.author.id === msg.guild.ownerID) {
            msg.channel.send("Prefix changed to \"" + args[1] + "\" In order to change it back, do " + args[1] + " prefix " + guilds[msg.guild.id].char);
            guilds[msg.guild.id].char = args[1];
        }
    }
}

function playyoutube(msg) {
    if (msg.member.voiceChannel) {
        msg.member.voiceChannel.join().then(connection => {
            const stream = ytdl(msg.content.split(" ")[1], {
                filter: 'audioonly'
            });
            stream.on("error", (e) => {
                log.error(e);
            });
            msg.guild.voiceConnection.dispatcher = connection.playStream(stream, streamOptions);
        });
    }
    else {
        msg.reply('Connect to Voice Channel first!');
    }
}

function alias(msg) {
    var guild = guilds[msg.guild.id];
    var args = msg.content.toLowerCase().split(" ");
    var cmd;
    if (args[1] == "add") {
        if (guild.cmds[args[2]]) {
            if (args[2] !== args[3] && !guild.cmds[args[3]] && guild.cmds[args[2]].alias.indexOf(args[3]) === -1) {
                cmd = args[2];
                guild.cmds[args[2]].alias.push(args[3]);
            }
        }
    }
    else if (args[1] == "remove") {
        if (guild.cmds[args[2]]) {
            if (args[2] !== args[3] && guild.cmds[args[2]].alias.indexOf(args[3]) !== -1) {
                cmd = args[2];
                guild.cmds[args[2]].alias = guild.cmds[args[2]].alias.filter(function(word) {
                    return word !== args[3];
                });
            }
        }
    }
    else if (args[1]) {
        if (guild.cmds[args[1]]) {
            cmd = args[1];
        }
    }
    if (cmd) {
        var str = guild.cmds[cmd].alias.join("\n+ ");
        var alias = (str) ? ("+ " + str) : ("- No alias found for " + cmd);

        var embed = new Discord.RichEmbed({
            title: "Alias for " + cmd,
            color: color
        });
        embed.setAuthor(client.user.username, client.user.avatarURL)
            .setDescription("```diff\n" + alias + "\n```")
            .setFooter(guild.char + msg.cmd + motd, client.user.avatarURL);
        msg.channel.send({
            embed
        });
    }
}

function purge(msg) {
    var args = msg.content.split(" ");
    if (!args[1]) return;
    let messagecount = parseInt(args[1]);
    msg.channel.fetchMessages({limit: messagecount+1}).then(messages => msg.channel.bulkDelete(messages));
}

function role(msg) {
    var guild = guilds[msg.guild.id];
    var args = msg.content.toLowerCase().split(" ");
    if (!args[1]) return;
    if (args[1] == "list") {
        var string = "";
        for (var i in guild.access) {
            string += msg.guild.roles.get(i).name + " = " + guild.access[i] + "\n";
        }
        var embed = new Discord.RichEmbed({ title: "Listing access levels", color: color })
            .setAuthor(client.user.username, client.user.avatarURL)
            .setDescription("```\n" + string + "\n```")
            .setFooter(guild.char + msg.cmd + motd);
        msg.channel.send({ embed });
    }
    if (args[1] == "add") {
        if (!args[2]) return;
        var int = parseInt(args[2]);

    }
}
client.on('message', function(msg) {
    if (msg.channel.type == "dm") return;
    var guild = guilds[msg.guild.id];
    msg.accessLevel = 0;
    for (var j of msg.member.roles) {
        if (guild.access[j.id] > msg.accessLevel) msg.accessLevel = guild.access[j.id];
    }
    if (msg.author.id == msg.guild.ownerID) msg.accessLevel = Infinity; /* server owner is B0SS */
    var prefix = guild.char || "!"; /*useless - wont accept messages from dms, for now.*/
    if (msg.guild) {
        if (!msg.content.startsWith(prefix)) return;
        var args = msg.content.split(" "); //get arguments
        msg.cmd = args[0].replace(prefix, ""); //getcmd according to prefix
    }
    if (msg.author.id == client.user.id) return;
    var keys = Object.keys(guild.cmds); //thx electrashave
    for (var i = 0; keys.length > i; i++) {
        var cmd = guild.cmds[keys[i]];
        if (msg.cmd == keys[i] || cmd.alias && cmd.alias.indexOf(msg.cmd) != -1) {
            if (msg.accessLevel >= cmd.access) cmds[keys[i]](msg); //command found
            break;
        }
    }
});

client.on("ready", function() {
    starts++;
    if (starts <= 1) {
        guilds = {};
        var settings = JSON.parse(fs.readFileSync("./save.json"));
        var connectedGuilds = client.guilds.array();
        for (var j in connectedGuilds) {
            if (!guilds[connectedGuilds[j].id]) {
                guilds[connectedGuilds[j].id] = new GuildSettings();
                log.info("Initialized new guild settings: " + connectedGuilds[j].name);
                guilds[connectedGuilds[j].id].access[connectedGuilds[j].id] = 0;
            }
        }
        console.dir(guilds);
        log.info("LightningBot Started up!");
        client.user.setGame("node.js");
        client.fetchApplication().then((app) => owner = app.owner);
    }
    else {
        log.warn("Unknown Startup at " + new Date(Date.now()).toLocaleString() + " Startups: " + starts + ". Likely a local failure, or slight discord downtime causing a bot restart.");
    }
});


function output(token) {
    if (!token) {
        log.error('There was an error logging in');
        return;
    }
    else {
        log.info('Logged in. Token: ' + token);
        client_id = client.user.id;
        log.log("https://discordapp.com/oauth2/authorize?client_id=" + client_id + "&scope=bot&permissions=8");
    }
}

client.login(loginToken).then(output);

function exitHandler(err) {
    if (err) {
        console.log(err);
    }
    if (stops == 0) {
        stops++;
        fs.writeFileSync("./save.json", JSON.stringify(guilds, null, 4));
        log.info("Closed.");
        client.destroy();
    }
    process.exit(1);
}
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', exitHandler);
process.stdin.resume();
