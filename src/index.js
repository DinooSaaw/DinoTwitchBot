const bigBang = Date.now();
// Dependancies
const tmi = require("tmi.js");
const DinooSaawConfig = require("./Assets/auths/DinooSaaw.json");
const PoliceDinooConfig = require("./Assets/auths/PoliceDinoo.json");
const ListenerConfig = require("./Assets/auths/Listener.json");
const rhinocerosConfig = require("./Assets/auths/rhinoceros42069.json");
const masterpodcastviewerConfig = require("./Assets/auths/masterpodcastviewer.json");
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
let ClientCheck = false

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
  console.log(`DinooSaaw's Users ${DinoChannelUsers}`.red)
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

function GrabUser(){
      const fetchu = fetchUrl(
        "https://api.twitch.tv/helix/users",
        {
          headers: {
            "Client-ID": "xoqw101tcirrskbzn3rpbqt2kdjhu0",
            Authorization: "Bearer " + DinooSaawConfig.identity.password,
          },
        })
        console.log(fetchu)
}

class AuthLib {
  async init() {
    // twconf
  }
  fetchToken() {
    // `https://id.twitch.tv/oauth2/authorize?client_id=${DinooSaawConfig.identity.clientID}&redirect_uri=http://localhost&response_type=token`
  }
  fetchUser() {
    return new Promise((resolve, reject) => {
      const fetchu = fetchUrl(
        "https://api.twitch.tv/helix/users",
        {
          headers: {
            "Client-ID": "xoqw101tcirrskbzn3rpbqt2kdjhu0",
            Authorization: "Bearer " + DinooSaawConfig.identity.password,
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
    if (ClientCheck == true){
      console.log(`${rhinocerosConfig.identity.username} is Connected`.bold.brightGreen)
      console.log(`${masterpodcastviewerConfig.identity.username} is Connected`.bold.brightGreen)
      console.log(`Connected to `.bold.brightWhite + `${addr}:${port}`.bold.brightGreen);
    } else {
      console.log(`Connected to `.bold.brightWhite + `${addr}:${port}`.bold.brightGreen);
      // GrabUser()
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
        if (msg === `!lurk`){
          CLIENTS["Bot"].say("dinoosaaw", `${context.username} Is Now Lurking From Me! I Will Find You`)
          let Fu = DinoChannelUsers
          .map(function (user) {
            return user;
          })
          .indexOf(context.username);
          DinoChannelUsers.splice(Fu, 1); 
        }

        if (msg === `!context`){
          console.log(context)
        }
        if (msg === `!dino.bot`){
          CLIENTS["Bot"].say(target, `Shhh`)
        }
        if (msg === `!channelusers`){
          CLIENTS["Bot"].say("dinoosaaw", `DinooSaaw's Viewers Are: ${DinoChannelUsers}`)
          console.log(DinoChannelUsers)
        }
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
    } else  {
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

  async onDinoUserJoin(channel, username, self) {
    let Fu = DinoChannelUsers
    .map(function (user) {
      return user;
    })
    .indexOf(username);
  if (Fu == -1) {
    DinoChannelUsers.push(username);
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

  async onDinoUserPart(channel, username, self) {
    let Fu = DinoChannelUsers
    .map(function (user) {
      return user;
    })
    .indexOf(username);
    DinoChannelUsers.splice(Fu, 1); 
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
    var Channel = chan.replace("#dinoosaaw", "[DinooSaaw] ");
    console.log(`${Channel}`.green + `Chat Has Been Cleared`.bold.brightWhite);
  }

  async onMessagedeleted(chan, username, deletedMessage, context) {
    var Channel = chan.replace("#dinoosaaw", "[DinooSaaw] ");
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
    var Channel = channel.replace("#dinoosaaw", "[DinooSaaw] ");
    if (autohost) return console(`${Channel} has autohosted`);
    console.log(
      `${Channel}`.green +
        `Has Been Hosted By `.bold.brightWhite +
        `${username}`.brightYellow +
        `For`.bold.brightWhite +
        `${viewers}!`.brightYellow
    );
    CLIENTS["Bot"].say(
      channel,
      `Thank you ${username} for the host and bringing your community of ${viewers}!`
    );
  }

  async onSlowmode(channel, enabled, length) {
    var Channel = channel.replace("#dinoosaaw", "[DinooSaaw] ");
    var time = sf.convert(length).format("Mmin Ss");

    if (length != "0") {
      console.log(
        `${Channel}`.green + `Is Now In Slow Mode Of ${time}!`.bold.brightWhite
      );
      CLIENTS["Bot"].say(channel, `The chat is now in slow mode!`);
    } else {
      console.log(
        `${Channel}`.green + `Is No Longer In Slow Mode`.bold.brightWhite
      );
      CLIENTS["Bot"].say(channel, `The chat is no longer in slow mode!`);
    }
  }
  async onFollowersonly(channel, enabled, length) {
    var Channel = channel.replace("#dinoosaaw", "[dinoosaaw] ");
    var time = sf.convert(length).format("NmonthDdays HHhours Mmin Ss");

    if (length != "0") {
      console.log(
        `${Channel}`.green +
          `Is Now In Follow Only Of ${time}!`.bold.brightWhite
      );
      CLIENTS["Bot"].say(channel, `The chat is now in Follower Only!`);
    } else {
      console.log(
        `${Channel}`.green + `Is No Longer In Follower Only`.bold.brightWhite
      );
      CLIENTS["Bot"].say(channel, `The chat is no longer in Follower Only!`);
    }
  }
  async onTimeout(channel, username, reason, duration, userstate) {
    var Channel = channel.replace("#dinoosaaw", "[dinoosaaw] ");
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
    var Channel = channel.replace("#dinoosaaw", "[dinoosaaw] ");
    console.log(
      `${Channel}`.green +
        `is getting ${raided} by username with ${viewers} raiders`.bold
          .brightWhite
    );
    CLIENTS["Listener"].say(
      channel,
      `Thank you ${username} for the raid and bringing the raid of ${viewers}`
    );
  }

  async onHosting(channel, target, viewers) {
    var Channel = channel.replace("#dinoosaaw", "[dinoodaaw] ");
    console.log(
      `${Channel}`.green +
        `Is now hosting ${target} with viewers`.bold.brightWhite
    );
    CLIENTS["Listener"].say(
      channel,
      `We are now hosting ${target} they can also be found at https://twitch.tv/${target}!`
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
    CLIENTS["DinooSaaw"] = new tmi.client(DinooSaawConfig);
    CLIENTS["Bot"] = new tmi.client(PoliceDinooConfig);
    CLIENTS["Listener"] = new tmi.client(ListenerConfig);
    CLIENTS["rhinoceros"] = new tmi.client(rhinocerosConfig);
    CLIENTS["masterpodcastviewer"] = new tmi.client(masterpodcastviewerConfig);
    // Message Event
    CLIENTS["Listener"].on("message", tl.onMessageHandler);
    CLIENTS["DinooSaaw"].on("connected", tl.onConnectedHandler);
    CLIENTS["Listener"].on("join", tl.onUserJoin);
    CLIENTS["DinooSaaw"].on("join", tl.onDinoUserJoin);
    CLIENTS["DinooSaaw"].on("part", tl.onDinoUserPart);
    CLIENTS["Listener"].on("part", tl.onUserPart);
    CLIENTS["DinooSaaw"].on("clearchat", tl.onClearChat);
    CLIENTS["DinooSaaw"].on("messagedeleted", tl.onMessagedeleted);
    CLIENTS["DinooSaaw"].on("followersonly", tl.onFollowersonly);
    CLIENTS["DinooSaaw"].on("hosted", tl.onHosted);
    CLIENTS["DinooSaaw"].on("hosting", tl.onHosting);
    CLIENTS["DinooSaaw"].on("raided", tl.onRaided);
    CLIENTS["DinooSaaw"].on("mod", tl.onMod);
    CLIENTS["DinooSaaw"].on("timeout", tl.onTimeout);
    CLIENTS["DinooSaaw"].on("slowmode", tl.onSlowmode);
    CLIENTS["DinooSaaw"].on("notice", tl.onNotice);
    CLIENTS["DinooSaaw"].on("reconnect", tl.onReconnect);
    CLIENTS["DinooSaaw"].on("roomstate", tl.onRoomState);
    CLIENTS["DinooSaaw"].on("usernotice", tl.onUserNotice);
    CLIENTS["DinooSaaw"].on("userstate", tl.onUserState);
    CLIENTS["DinooSaaw"].connect();
    CLIENTS["Bot"].connect();
    CLIENTS["Listener"].connect();
    if (ClientCheck == true) {
      CLIENTS["rhinoceros"].connect();
      CLIENTS["masterpodcastviewer"].connect();
    }
  }
}

let botclients = new BotClients();
botclients.twitchChat();