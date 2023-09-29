const mc = require('mineflayer');
const { mapDownloader } = require("mineflayer-item-map-downloader");
const path = require("path");
const jimp = require("jimp");
const tg = require("../index");

class bot {
  constructor(username, uniqueId) {
    this.username = username;

    this.botObj = null;
    this.chatEnabled = true;
    this.uniqueId = uniqueId;
  }

  setup() {
    this.botObj = mc.createBot({
      username: this.username,
      host: "mc.angelgrief.net",
      port: 25565,
      version: "1.18.2",
      "mapDownloader-saveToFile": true,
      "mapDownloader-outputDir": path.join(__dirname, "../maps")
    });

    this.botObj.loadPlugin(mapDownloader);

    this.getBot().on("windowOpen", window => {
      let msg = "Окно: " + window.title + "\n";

      for (let i = 0; i < window.slots.length; i++) {
        const slot = window.slots[i];

        if (slot)
          msg += `${i + 1}: Название: ${slot.name} x${slot.count}\n`;
      }

      tg.tg.send(msg);
    })
  }

  getBot() {
    return this.botObj;
  }

  getUsername() {
    return this.username;
  }

  getUniqueId() {
    return this.uniqueId;
  }

  changeUsername(username) {
    this.username = username;
  }

  setChat(chat) {
    this.chatEnabled = chat;
    tg.tg.send(`Чат для бота ${this.getUsername()} успешно ${chat ? "включен!" : "выключен!"}`);
  }

  disconnect() {
    this.botObj.end();
  }

  send(message) {
    this.botObj.chat(message);
  }

  windowClick(slot) {
    this.botObj.clickWindow(slot - 1, 0, 0);
  }

  rightClick() {
    this.botObj.activateItem();
  }

  hotbar(slot) {
    this.botObj.setQuickBarSlot(slot);
  }

  solveMap() {
    const username = this.getUsername();

    let saveMaps = 6;
    let saved = 0;
    const width = 336;
    const height = 256;

    const imagePaths = [
      './maps/map_000005.png',
      './maps/map_000004.png',
      './maps/map_000003.png',
      './maps/map_000002.png',
      './maps/map_000001.png',
      './maps/map_000000.png'
    ]

    const mergeImages = (imagePaths, mergedImagePath, width, height) => {
      const mergedImage = new jimp(width * 3, height * 2);

      Promise.all(imagePaths.map(path => jimp.read(path)))
        .then(images => {
          images.forEach((image, i) => {
            const x = (i % 3) * width;
            const y = Math.floor(i / 3) * height;
            image.resize(width, height);
            mergedImage.blit(image, x, y);
          });
          mergedImage.write(mergedImagePath);
        })
        .catch(err => console.error(err));
    };

    this.botObj.on('new_map_saved', function(data) {
      saved++;
      if (saved === saveMaps) {
        setTimeout(() => {
          mergeImages(imagePaths, `map_${username}.jpg`, width, height);
        }, 3000);
        setTimeout(() => {
          tg.tg.send(`./map_${username}.jpg`, true, username);
        }, 5000);
      }
    });
  }
}

function removeJSONchars(str) {
  if (str !== null) {
    return str.replace(/[^\u0400-\u04FF\s]/g, '');
  }
  return '';
}

module.exports = bot;