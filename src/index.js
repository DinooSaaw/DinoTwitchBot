const bigBang = Date.now();
// Dependancies
const tmi = require("tmi.js");
const Config = require("./Assets/auths/Auth.json");
const sf = require("seconds-formater");
const color = require("colors");
const hex =  require("./Assets/hexs/colours.json")
const chalk = require("chalk");
const fetchUrl = require("fetch").fetchUrl;
// STORE VALS
let CLIENTS = [];
let ROOMSTATE;
let channelUsers = [];
let DinoChannelUsers = [];
let ClientCheck = '1'

class DBLib {
  dbCheck() {
    return new Promise((resolve, reject) => {
      sqlConn.query("SELECT 1 + 1 AS solution", function (
        error,
        results,
        fields
      ) {
        if (error) console.log(`utils.dbcheck`, error);
        if (results[0].solution == 2) {
          resolve(true);
        } else resolve(false);
      });
    });
  }
}

//setTimeout(UserList, 3000)

function UserList(){
  console.log(`Global Users ${channelUsers}`.red)
  console.log(bigBang)
}
// PingLib
let pingStart = 0;
class PingLib {
  startPingTimer() {}
  sendPing() {}
  awaitPong() {}
  clearPingTimer() {}
}
// PubSub
class PubLib {
  async requestListen(topics, token) {
    let pck = {};
    pck.type = "LISTEN";
    pck.nonce = myname + "-" + new Date().getTime();

    pck.data = {};
    pck.data.topics = topics;
    if (token) {
      pck.data.auth_token = token;
    }
    pubsub.send(JSON.stringify(pck));
  }
}

class AuthLib {
  async init() {
    // twconf
  }
  fetchToken() {
    // `https://id.twitch.tv/oauth2/authorize?client_id=${Config.identity.clientID}&redirect_uri=http://127.0.0.1:8000&response_type=token`
  }
  fetchUser() {
    return new Promise((resolve, reject) => {
      let fetchu = fetchUrl(
        "https://api.twitch.tv/helix/users",
        {
          headers: {
            "Client-ID": Config.identity.clientID,
            Authorization: "Bearer " + Config.identity.password,
          },
        },
        function (error, meta, body) {
          let bs = JSON.parse(body);
          resolve(bs);
        }
      );
    });
  }
}

// Twitch Chat
class TwitchChatLib {
  async onConnectedHandler(addr, port) {
    if (ClientCheck == '1'){
      console.log(`Connected to `.bold.brightWhite + `${addr}:${port}`.bold.brightGreen);
    } else {
      console.log(`Connected to `.bold.brightWhite + `${addr}:${port}`.bold.brightGreen);
    }
  }

  async onMessageHandler(target, context, msg, self) {
    if (context["message-type"] == "whisper") {
      let pre = `[${context["user-id"]}]`;
      pre += ` {whisper} ${context["display-name"]}`;
      pre += ` || `;
      pre += msg.grey;
      console.log(pre);
    } else {
      if(msg.substr(0, 1) == "!"){
        let _Auth = new AuthLib; 
        console.log(`Command:`, msg)
        //CLIENTS['Bot'].say(target, `chat`);
        await _Auth.fetchUser();
        
    }
      else {
          let pre = `[${context["user-id"]}]`.magenta;
          // if (context.badges.broadcaster == '1') {pre += chalk.hex(hex.hex.Streamers)` {BROADCASTER}`;}
          if (context.subscriber) {pre += chalk.hex(hex.hex.Subscriber)` {SUB}`;}
          if (context.mod) {pre += chalk.hex(hex.hex.ChatModerator)` {MOD}`;}
          if (context.turbo) {pre += chalk.hex(hex.hex.TurboUser)` {TURBO}`;}
          if (context.color) {pre += chalk.hex(context.color)(` ${context["display-name"]}`);}
          if (!context.color) {pre += chalk.keyword('white')(` ${context["display-name"]}`);}
          pre += ` || `.magenta;
          pre += msg.bold.brightWhite;
          console.log(`${pre}`);
    }
    //console.log("context", context);
    //console.log();
    }
}
  async onUserJoin(channel, username, self) {
    var Channel = channel.replace("#", "");
    if (self) {
      console.log(`Connected to : `.bold.brightWhite + `[${Channel}]`.green);
    } else {
      console.log(
        `[${Channel}] `.green +
          `ChatUsers[${channelUsers.length}] ${username} Joined`.bold
            .brightWhite
      );
    }
    let Fu = channelUsers
      .map(function (user) {
        return user;
      })
      .indexOf(username);
    if (Fu == -1) {
      channelUsers.push(username);
    }
  }

  async onUserPart(channel, username, self) {
    var Channel = channel.replace("#", "");
    if (self) {
      console.log(`Disconnected From : `.chalk.keyword('RED') + `[${Channel}]`.green);
    }
    let Fu = channelUsers
      .map(function (user) {
        return user;
      })
      .indexOf(username);
    channelUsers.splice(Fu, 1);
    console.log(
      `[${Channel}] `.green +
        `ChatUsers[${channelUsers.length}] ${username} parted`.red
    );
  }

  async onReconnect() {
    console.log(`reconnected`.bold.brightWhite);
  }

  async onMod(channel, username) {
    var Channel = channel.replace("#", "");
    console.log(
      `${Channel}`.green + `${username} has became a mod`.bold.brightWhite
    );
  }

  async onClearChat(chan, user) {
    console.log(`${Channel}`.green + `Chat Has Been Cleared`.bold.brightWhite);
  }

  async onMessagedeleted(chan, username, deletedMessage, context) {
    let pre = `[${context["user-id"]}]`.magenta;
    if (context.subscriber) {
      pre += ` {SUB}`.red;
    }
    if (context.mod) {
      pre += chalk.hex("82F282")` {MOD}`;
    }
    if (context.turbo) {
      pre += chalk.hex("6441a5")` {TURBO}`;
    }
    if (context.color == "0") {
      context.color = "00a0b0";
    }
    console.log(chalk.hex(context.color)(context.color));
    pre += chalk.hex(context.color)(` ${context["display-name"]}`);
    pre += ` || `.magenta;
    pre += deletedMessage.bold.brightWhite;
    console.log(`${pre}`);
  }

  async onHosted(channel, username, viewers, autohost) {
    if (autohost) return console(`${Channel} has autohosted`);
    console.log(
      `${Channel}`.green +
        `Has Been Hosted By `.bold.brightWhite +
        `${username}`.brightYellow +
        `For`.bold.brightWhite +
        `${viewers}`.brightYellow
    );
  }
  async onSlowmode(channel, enabled, length) {
    var time = sf.convert(length).format("Mmin Ss");

    if (length != "0") {
      console.log(
        `${Channel}`.green + `Is Now In Slow Mode Of ${time}!`.bold.brightWhite
      );
  }
}
       
  async onFollowersonly(channel, enabled, length) {
    var time = sf.convert(length).format("NmonthDdays HHhours Mmin Ss");

    if (length != "0") {
      console.log(
        `${Channel}`.green +
          `Is Now In Follow Only Of ${time}!`.bold.brightWhite
      );
    }
  }
  async onTimeout(channel, username, reason, duration, userstate) {
    var time = sf.convert(duration).format("Mmin Ss");

    if (duration != "1") {
      console.log(
        `${Channel}`.green +
          `${username} has been timedout for ${time}`.bold.brightWhite
      );
    }
  }

  async onNotice(channel, data) {
    console.log(`notice ${channel}`, data);
  }

  async onRaided(channel, username, viewers) {
    console.log(
      `${Channel}`.green +
        `is getting ${raided} by username with ${viewers} raiders`.bold
          .brightWhite
    );
  }
  async onHosting(channel, target, viewers) {
    var Channel = channel.replace("#dinoosaaw", "[dinoodaaw] ");
    console.log(
      `${Channel}`.green +
        `Is now hosting ${target} with viewers`.bold.brightWhite
    );
  }
  
  async onUserNotice(chan, data) {
    console.log(`usernotice`, data);
  }

  async onUserState(chan, data) {
    console.log(`userstate`, data);
  }

  async onRoomState(chan, state) {
    ROOMSTATE = state;
  }
}
class BotClients {
  async twitchChat() {
    let tl = new TwitchChatLib();
    CLIENTS["Bot"] = new tmi.client(Config);
    // Message Event
    CLIENTS["Bot"].on("message", tl.onMessageHandler);
    CLIENTS["Bot"].on("connected", tl.onConnectedHandler);
    CLIENTS["Bot"].on("join", tl.onUserJoin);
    CLIENTS["Bot"].on("part", tl.onUserPart);
    CLIENTS["Bot"].on("clearchat", tl.onClearChat);
    CLIENTS["Bot"].on("messagedeleted", tl.onMessagedeleted);
    CLIENTS["Bot"].on("followersonly", tl.onFollowersonly);
    CLIENTS["Bot"].on("hosted", tl.onHosted);
    CLIENTS["Bot"].on("raided", tl.onRaided);
    CLIENTS["Bot"].on("mod", tl.onMod);
    CLIENTS["Bot"].on("timeout", tl.onTimeout);
    CLIENTS["Bot"].on("slowmode", tl.onSlowmode);
    CLIENTS["Bot"].on("notice", tl.onNotice);
    CLIENTS["Bot"].on("reconnect", tl.onReconnect);
    CLIENTS["Bot"].on("roomstate", tl.onRoomState);
    CLIENTS["Bot"].on("usernotice", tl.onUserNotice);
    CLIENTS["Bot"].on("userstate", tl.onUserState);
    CLIENTS["Bot"].connect();
  }
}

let botclients = new BotClients();
botclients.twitchChat();