const mkdirp = require("mkdirp");
const fs = require("fs");
const getDirName = require("path").dirname;

module.exports = function() {
  let chat_db = "chat_db.json";
  let dbPath = `./chats/${
    new Date().toLocaleString().split(" ")[0]
  }_${chat_db}`;

  let writeFile = (path, content, callback) => {
    mkdirp(getDirName(path), err => {
      if (err) return callback(err);
      fs.writeFile(path, content, callback);
    });
  };

  this.getChats = () => {
    return new Promise((resolve, reject) => {
      fs.access(dbPath, fs.constants.F_OK, err => {
        if (!err) {
          fs.readFile(dbPath, "utf8", (err, content) => {
            if (!err) {
              resolve(content);
            } else {
              reject(err);
            }
          });
        } else {
          writeFile(dbPath, JSON.stringify([]), () => {
            resolve(false);
          });
        }
      });
    });
  };

  this.update = content => {
    fs.writeFile(dbPath, JSON.stringify(content), err => {
      if (err) throw err;
    });
  };
};
