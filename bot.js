const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const axios = require("axios")

// ========= TELEGRAM =========
const TELEGRAM_TOKEN = "8725386901:AAG2qjYUo2ik6u6bEGDSxLNatRV4M38O04o"
const CHAT_ID = "7089533955"
// ============================

async function sendTelegram(msg){
await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`)
}

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("auth")

const sock = makeWASocket({
auth: state,
printQRInTerminal: true
})

sock.ev.on("creds.update", saveCreds)

// ========= MESSAGE SYSTEM =========
sock.ev.on("messages.upsert", async ({messages})=>{
const m = messages[0]
if(!m.message) return

const msg = m.message.conversation || m.message.extendedTextMessage?.text
const from = m.key.remoteJid

// ===== START PAIR =====
if(msg?.startsWith("START")){
let number = msg.replace("START ","")

await sendTelegram(`🔗 Pair Request\nNumber: ${number}`)
}

// ===== PDF MODE =====
if(msg === "PDF ON"){
await sendTelegram(`📄 PDF MODE ON\nUser: ${from}`)
}

// ===== ADMIN ALERT =====
if(m.message?.protocolMessage?.type === 14){
await sendTelegram(`👑 Admin দেওয়া হয়েছে\nGroup: ${from}`)
}

})

}

startBot()
