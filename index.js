const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("auth")

const sock = makeWASocket({
auth: state
})

sock.ev.on("creds.update", saveCreds)


// 🔐 PAIRING LOGIN SYSTEM
if (!sock.authState.creds.registered) {

const rl = require("readline").createInterface({
input: process.stdin,
output: process.stdout
})

rl.question("Enter your WhatsApp number: ", async (number) => {

const code = await sock.requestPairingCode(number)
console.log(`Pairing Code: ${code}`)

})

}


// 📩 MESSAGE SYSTEM
sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]
if (!msg.message) return

const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid

const body =
msg.message.conversation ||
msg.message.extendedTextMessage?.text || ""


// 📜 MENU
if(body === "!menu"){

let menu = `
╭───〔 𝐃𝐀𝐑𝐊 𝐆𝐀𝐍𝐆 〕───⬣
│ create by ᴅᴀʀᴋ ᴏʙɪᴛᴏ
╰────────────⬣

👑 ADMIN COMMANDS

➤ !tagall
➤ !kick @user
➤ !allkick
➤ !promote @user
➤ !demote @user

🛡️ SECURITY

➤ Anti Link ON
➤ Auto Delete Link

👋 GROUP

➤ Welcome Msg
➤ Admin Alert
`

sock.sendMessage(from,{text:menu})
}


// 📢 TAG ALL
if (body === "!tagall") {

const metadata = await sock.groupMetadata(from)
const members = metadata.participants.map(p => p.id)

await sock.sendMessage(from,{
text:"📢 Tagging All",
mentions: members
})
}


// 🚫 KICK
if (body.startsWith("!kick")) {

const metadata = await sock.groupMetadata(from)
const isAdmin = metadata.participants.find(p => p.id === sender && p.admin)

if(!isAdmin) return sock.sendMessage(from,{text:"❌ Admin Only"})

const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid

await sock.groupParticipantsUpdate(from, mentioned, "remove")
sock.sendMessage(from,{text:"🚫 Removed"})
}


// 🔥 ALL KICK
if(body === "!allkick"){

const metadata = await sock.groupMetadata(from)
const isAdmin = metadata.participants.find(p => p.id === sender && p.admin)

if(!isAdmin) return sock.sendMessage(from,{text:"❌ Admin Only"})

let members = metadata.participants
.filter(p => !p.admin)
.map(p => p.id)

await sock.groupParticipantsUpdate(from, members, "remove")

sock.sendMessage(from,{text:"⚠️ All Members Removed"})
}


// 👑 PROMOTE
if (body.startsWith("!promote")) {

const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid

await sock.groupParticipantsUpdate(from, mentioned, "promote")
sock.sendMessage(from,{text:"👑 Promoted"})
}


// ⬇️ DEMOTE
if (body.startsWith("!demote")) {

const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid

await sock.groupParticipantsUpdate(from, mentioned, "demote")
sock.sendMessage(from,{text:"⬇️ Demoted"})
}


// 🔗 ANTI LINK
if (body.includes("https://chat.whatsapp.com")) {

const metadata = await sock.groupMetadata(from)
const isAdmin = metadata.participants.find(p => p.id === sender && p.admin)

if (!isAdmin){
await sock.sendMessage(from,{text:"🚫 Link Not Allowed"})
await sock.sendMessage(from,{delete: msg.key})
}
}

})


// 👋 WELCOME + 👑 ADMIN ALERT
sock.ev.on("group-participants.update", async (data) => {

if(data.action === "add"){
await sock.sendMessage(data.id,{text:"👋 Welcome To 𝐃𝐀𝐑𝐊 𝐆𝐀𝐍𝐆"})
}

if(data.action === "promote"){
await sock.sendMessage(data.id,{text:"👑 New Admin Added"})
}

})

}

startBot()
