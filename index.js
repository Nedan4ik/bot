const bot = require('./util/bot');
const telegram = require("./util/telegram");
const { v4: uuidv4 } = require('uuid');

const tg = new telegram("6124429322:AAF8wwnmt4NMhgQjfX1HX82We3YIkYN7yRs", 5100999758);

tg.setup();
tg.send("Бот запущен!");

const bots = [123123];

const botsMap = {};

tg.getTelegram().on("message", msg => {
  msg = msg.text;

  if (msg === "Новый бот" || msg === "новый бот") {
    const botIndex = bots.length;
    const client = new bot("poncponc" + botIndex, uuidv4(0, 0, 0));
    bots.push(Math.floor(Math.random() * 10000));
    client.setup();
    botsMap[botIndex] = client;

    client.getBot().on("message", jsonMsg => {
      const msg = jsonMsg.toString();
      if (client.chatEnabled)
        tg.send(client.getUsername() + ": " + msg);

      const message = /AngelGuard » Вы ввели капчу неправильно. У вас (\d+) попытки!/.exec(msg);

      if (msg === "AngelGuard » Введите капчу с картинки в чат" || message)
        client.solveMap();
    });

    client.getBot().on("kicked", reason => {
      tg.send(client.getUsername() + ": Bot has been kicked: " + reason);

      const bot = botsMap[botIndex];

      if (bot && bot.getUniqueId() === client.getUniqueId()) {
        bots.splice(botIndex);
        delete botsMap[botIndex];
      }
    });

    client.getBot().on("end", reason => {
      tg.send(client.getUsername() + ": Bot has been ended: " + reason);

      const bot = botsMap[botIndex];

      if (bot && bot.getUniqueId() === client.getUniqueId()) {
        bots.splice(botIndex);
        delete botsMap[botIndex];
      }
    });

    tg.getTelegram().on("message", message => {
      message = message.text;

      const windowMatch = /(\d+) Окно клик (\d+)/i.exec(message);
      const rClickMatch = /(\d+) Пкм/i.exec(message);
      const leaveMatch = /(\d+) Выйти/i.exec(message);
      const chatMatch = /(\d+) Чат (.+)/i.exec(message);
      const chatEnableMatch = /(\d+) Чат (вкл|выкл)/i.exec(message);
      const deleteMatch = /(\d+) Удалить/i.exec(message);

      if (chatMatch) {
        const bIndex = chatMatch[1];
        const message = chatMatch[2];

        const bot = botsMap[bIndex];

        if (bot && bot.getUniqueId() === client.getUniqueId() && isValid(message)) {
          bot.send(message);
        }

        function isValid(message) {
          return message !== "выкл" && message !== "вкл" && message !== "Выкл" && message !== "Вкл";
        }
      }

      if (deleteMatch) {
        const bIndex = parseInt(deleteMatch[1]);

        const bot = botsMap[bIndex];

        if (bot && bot.getUniqueId() === client.getUniqueId()) {
          bot.disconnect();
          bots.slice(bIndex);
          tg.send("Бот с индексом " + bIndex + " успешно удалён!")
          delete botsMap[bIndex];
          botsMap[bIndex] = undefined;
        }
      }

      if (chatEnableMatch) {
        const bIndex = chatEnableMatch[1];
        const enableCommand = chatEnableMatch[2].toLowerCase();

        const bot = botsMap[bIndex];

        if (bot && bot.getUniqueId() === client.getUniqueId()) {
          if (enableCommand === "вкл" || enableCommand === "выкл") {
            bot.setChat(enableCommand === "вкл");
          }
        }
      }

      if (rClickMatch) {
        const bIndex = rClickMatch[1];

        const bot = botsMap[bIndex];

        if (bot && bot.getUniqueId() === client.getUniqueId()) {
          bot.rightClick();
        }
      }

      if (leaveMatch) {
        const bIndex = leaveMatch[1];

        const bot = botsMap[bIndex];

        if (bot && bot.getUniqueId() === client.getUniqueId()) {
          bot.disconnect();
        }
      }

      if (windowMatch) {
        const bIndex = windowMatch[1];
        const slot = parseInt(windowMatch[2]);

        const bot = botsMap[bIndex];
        if (bot && bot.getUniqueId() === client.getUniqueId()) {
          bot.windowClick(slot);
        }
      }
    })
  }
})

module.exports.tg = tg;