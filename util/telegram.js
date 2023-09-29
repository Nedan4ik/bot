const tg = require('node-telegram-bot-api');

class bot {
    constructor(token, chatId) {
        this.token = token;
        this.chatId = chatId;

        this.tg = null;
    }

    setup() {
        this.tg = new tg(this.token, { polling: true });
    }

    send(message, photo, caption) {
        if (!photo)
            this.tg.sendMessage(this.chatId, message);
        else
            this.tg.sendPhoto(this.chatId, message, { caption: caption });
    }

    getTelegram() {
        return this.tg;
    }
}

module.exports = bot;