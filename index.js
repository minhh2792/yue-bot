
require("dotenv").config();
const { BOT_PREFIX, BOT_TOKEN } = process.env;

const { Client, Collection }= require("discord.js");
const fs = require("fs");
const path = require("path");

const { version } = require("./package.json");

const Server = require("./server")();
const logging = new (require("./utils/log"))();
const db = require("./utils/database");

const client = new Client();
client.commands = new Collection();

console.log(`\n`);
logging.log(`Đang khởi chạy Yue-Bot v${version}`);
logging.log(`Đây là một dự án mã nguồn mở, bạn có thể xem mã nguồn tại GitHub: https://github.com/Kaysil/yue-bot`);
logging.log(`(C) 2020 - Made by Kaysil`);
console.log(`\n`);

fs.readdirSync(path.join(__dirname, "commands")).filter(files => files.endsWith(".js")).forEach(commandFile => {
    var commandData = require(path.join(__dirname, "commands", commandFile));

    commandData.commands.forEach(command => {
        client.commands.set(command, commandData);
        logging.log(`Đã load xong lệnh "${command}" của file "${commandFile}"`);
    });

    logging.log(`Đã load xong file "${commandFile}"`);
});

client.on("ready", () => {
    logging.log(`Đã dăng nhập với username là ${client.user.tag}`);
    client.user.setActivity("yue-bot.org | /help", {
        type: "PLAYING"
    });
});
 
client.on("message", (message) => {
    if (!db.get("users").find({ id: message.author.id }).value()) db.get("users").push({ id: message.author.id, score: 0, level: 0 }).write()

    db.get("users")
    .find({ id: message.author.id })
    .update("score", (level) => level + 1)
    .write()

    if (!message.content.startsWith(BOT_PREFIX) || message.author.bot) return;

	const args = message.content.slice(BOT_PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (!client.commands.has(command)) return;
    client.commands.get(command).execute(client, message, args);
});

client.login(BOT_TOKEN);