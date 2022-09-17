var isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)

var query = {
  "v": 3,
  "q": {
    "find": {
      "MAP.app":{ "$in":["blockpost.network","bitchat","jamify"] },
      "MAP.type": { "$in": ["post","chat"] }, 
    },
    "sort": {
      "blk.t": -1
    },
    "limit": 100
  }
}

var sock = {
  "v":3,
  "q":{
    "find":{
      "MAP.type": {"$in": ["post","chat"]}, 
      "MAP.app":{"$in":["blockpost.network","bitchat", "jamify"]}
    },
    "sort": {
      "blk.t": -1
    }
  }
}


// get window query params, set channel context if needed
const searchParams = new URLSearchParams(window.location.search);

if (searchParams.has('c')) {
  query.q.find['MAP.channel'] = searchParams.get('c')
  sock.q.find['MAP.channel'] = searchParams.get('c')
} else {
  query.q.find['MAP.channel'] = { '$exists': false }
  sock.q.find['MAP.channel'] = { '$exists': false }
}

// var sock = {
//   "v": 3,
//   "q": {
//     "find": {
//       "MAP.app": {"$in": ["bitchat", "blockpost.network"]}
//     }
//   }
  // "r": {
  //   "f": "[.[] | { m: .B.content, t: .blk.t, h: .tx.h }]"
  // }
//}
var balance

var audio = new Audio("https://bitchat.allaboardbitcoin.com/audio/notify.mp3")
var query_b64 = btoa(JSON.stringify(query))
var sock_b64 = btoa(JSON.stringify(sock))
var query_url = 'https://b.map.sv/q/'+query_b64
var socket_url = 'https://b.map.sv/s/'+sock_b64
var bitsocket

// Load audio
audio.load()

// template
document.addEventListener("DOMContentLoaded", function(e) {
  audio.volume = 0.25
  const initMuted = localStorage.getItem('bitchat.muted')
  audio.muted = initMuted === 'true'
  var paymail = localStorage.getItem('bitchat.paymail')

  document.querySelector("form").addEventListener("submit", async function(e) {
    e.preventDefault()
    e.stopPropagation()

    if (paymail) {
      // chat
      var chat = document.querySelector("#chat")
      var timestamp = parseInt(Date.now()/1000)
      var message = chat.value.trim()
      if (message === "/balance") {
        chat.value = ""
        refill()
        return
      } else if (message === '/credits') {
        let html = "<br><div>CREDITS</div><br>"
        // html += "<div>Funded via Faucet Bot API from <a href='https://allaboardbitcoin.com'>AllAboard.cash</a>.</div>"
        html += "<div>Powered by <a href='https://b.map.sv'>b.map.sv</a>, <a href='https://bitcoinschema.org'>BitcoinSchema.org</a>, <a href='https://allaboardbitcoin.com'>AllAboardBitcoin.com</a>, <a href='https://junglebus.gorillapool.io'>JungleBus</a> & the Bitcoin SV Blockchain.</div>"
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        return
      } else if (message.startsWith('/join ') || message.startsWith('/j ')) {
        let chunks = message.split(" ")
        if (chunks.length !== 2) {
          // TODO: Show usage error to user
          console.error('Wrong command size')
          return
        }
        const channel = chunks[1]
        if (channel) {
          window.location.href = 'https://bitchat.allaboardbitcoin.com/?c=' + channel.replace('#', '')
        }
        return
      } else if (message === '/list' || message === '/channels') {
        // TODO
        html += "<div>TODO</div>"
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        if (!audio.muted) {
          audio.play()
        }
        return
      } else if (message === '/mute') {
        localStorage.setItem('bitchat.muted', !audio.muted ? 'true' : 'false')
        let html = `<br><div>AUDIO ${ audio.muted ? 'UNMUTED' : 'MUTED'}</div><br>`

        audio.muted = !audio.muted

        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        if (bottom()) {
          document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
        }
        if (!audio.muted) {
          audio.play()
        }
        return
      } else if (message === '/help') {
        let html = helpHTML()
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        if (bottom()) {
          document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
        }
        return
      } else if (message === '/logout') {
        localStorage.removeItem('paymail')
        window.location.reload(true);
        return
      } else if (paymail && message.trim().length === 0) {
        alert("No blank messages")
        return
      }
      message = paymail + ": " + message
      /*
      if (/[^\x00-\x7F]+/.test(message)) {
        alert("Please only use English alphabet")
        return
      }
      */
  
      var i = document.querySelector("#chat")
      i.setAttribute("placeholder", "Posting...")
      i.setAttribute("readonly", "readonly")

      try {
        let dataPayload = [
          B_PREFIX, // B Prefix
          chat.value.trim(),
          "text/plain",
          "utf-8",
          "|",
          MAP_PREFIX, // MAP Prefix
          'SET',
          'app',
          'bitchat',
          'type',
          'chat',
          'paymail',
          paymail
        ];
        if (searchParams.has('c')) {
          dataPayload.push('context', 'channel', 'channel', searchParams.get('c'))
        }

        chat.value = ""
        const script = nimble.Script.fromASM(
          // dataPayload.map((d) => bops.from(d, 'utf8')))
          'OP_0 OP_RETURN ' + dataPayload.map((str) => bops.to(bops.from(str, 'utf8'), 'hex')).join(' ')
        );
        let resp = await relayone.send({
          outputs: [{script: script.toASM(), amount: 0, currency: 'BSV'}]
        })

        console.log("Sent", resp)
          let txid = resp.txid

          i.removeAttribute('readonly')
          i.removeAttribute('placeholder')
        } catch (e) {
          i.removeAttribute('readonly')
          i.removeAttribute('placeholder')
          console.error(e)
      }
    } else {
      // login

       // log into relay
      let token = await relayone.authBeta()

      const payloadBase64 = token.split('.')[0]; // Token structure: "payloadBase64.signature"
      const { paymail: returnedPaymail } = JSON.parse(atob(payloadBase64));
      localStorage.setItem("bitchat.paymail", returnedPaymail)
      const owner = await relayone.alpha.run.getOwner();
      
      var chat = document.querySelector("#chat")
      // var paymail = chat.value.trim()
      // localStorage.setItem('bitchat.paymail', paymail)
      window.location.reload(true)
    }
  })
  var source   = document.querySelector("#tpl").innerHTML
  var template = Handlebars.compile(source)
  var source2   = document.querySelector("#tpl2").innerHTML
  var template2 = Handlebars.compile(source2)

  // socket
  bitsocket = new EventSource(socket_url)
  bitsocket.onmessage = function(e) {
    var res = JSON.parse(e.data)
    var data = res.data[0]
    console.log(res)
    if (res.type === 'push') {
      if (!audio.muted) {
        audio.play()
      }
      var i = document.querySelector("#chat")
      i.setAttribute("placeholder", "")
      i.removeAttribute("readonly")
      data.m = `${data.MAP.paymail || data.AIP?.address}: ${data.B.content.trim()}`
      data.timestamp = moment(data.blk.t*1000).format('M/D, h:mm:ss a');
      data.h = data.tx.h
      var html = template2(data)
      var d = document.createElement("div")
      d.innerHTML = html
      if (data.MAP.type === 'post') {
        d.classList = "row post"
      } else {
        d.className = "row"
      }
      document.querySelector(".container").appendChild(d)

      if (bottom()) {       
        document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
      }
    } else if (res.type === 'block') {
      // TODO: put a new block message in the chat, BSV yellow color
      // var header = `NEW BLOCK ${data.block_height}`
     
      // figlet(header, '3D-ASCII', function(err, text) {
      //   if (err) {
      //     return
      //   }
      // })
    }
  }

  var paymail = localStorage.getItem('bitchat.paymail')
  if (paymail) {
    reload(template)
  } else {
    login()
  }
})

var bottom = function() {
  var container = document.querySelector(".container")
  var isbottom = (container.scrollTop + container.clientHeight + 100 >= container.scrollHeight)
  return isbottom
}

var login = function() {
  var header = "Bitchat"
  var headertext = "\n\n"
  figlet(header, '3D-ASCII', function(err, text) {
    if (err) {
      console.log('something went wrong...');
      console.dir(err);
      return;
    }
    if (isMobile) {
      headertext += ("<div class='pre'>### " + header + " ###</div>")
    } else {
      headertext += "<div class='pre'>" + text + "</div>"
    }
    headertext += "<div>Welcome.</div><br><br>"
    headertext += "<div>Bitchat is a Realtime Chatroom on the Bitcoin Blockchain.</div>"
    headertext += '<div>Your messages are stored on Bitcoin forever as a Bitcoin OP_RETURN transaction.</div>'
    headertext += "<div>A RelayX wallet is required. If you don't have one, sign up <a href='https://relayx.com/sign-up'>here</a></div>"

    headertext += "<br><br><br><div>Press Enter to log in...</div>"
    document.querySelector(".container").innerHTML = headertext
    document.querySelector(".container").scrollTop = document.querySelector('.container').scrollHeight
    document.querySelector("input[type=text]").focus()
  })
}

var welcome = function(res, template) {
  //updateStatus().then(() => {
    var reversed = {
      r: res.c.reverse().map((t) => {
        t.url = t.MAP.type === "post" && t.MAP.app === "blockpost.network" ? "https://blockpost.network/post/" : "https://whatsonchain.com/tx/"
        t.h = t.tx.h;
        t.classNames = `${t.MAP.type === 'post' ? 'post' : '' }`
        return t; 
      })
    }
    var header = "Bitchat"
    var headertext = "\n\n"
    figlet(header, '3D-ASCII', function(err, text) {
      if (err) {
        console.log('something went wrong...');
        console.dir(err);
        return;
      }
      if (isMobile) {
        headertext += ("<div class='pre'>### " + header + " ###</div>")
      } else {
        headertext += "<div class='pre'>" + text + "</div>"
      }
      var html = template(reversed)
      headertext += "Welcome " + localStorage.getItem('bitchat.paymail')
      headertext += "<br><br>"
      headertext += "<div>1. Your messages are stored on Bitcoin forever as an OP_RETURN transaction"
      headertext += "<div>2. Messages use BitcoinSchema and may show up on other websites."
      headertext += "<div>3. View each transaction on a block explorer by clicking the timestamp."

      headertext += helpHTML()

      document.querySelector(".container").innerHTML = html + headertext
      document.querySelector(".container").scrollTop = document.querySelector('.container').scrollHeight
      document.querySelector("input[type=text]").focus()
    })
  //})
}

var reload = function(template) {
  fetch(query_url).then(function(res) {
    return res.json()
  }).then(function(res) {
    res.c.forEach(function(item) {
      try {
        item.m = `${item.MAP.paymail || item.AIP.address}: ${item.B.content.trim()}`
      } catch (e) {
      }
      item.timestamp = moment(item.blk.t*1000).format('M/D, h:mm:ss a');
    })
    res.c = [...res.c.sort((a, b) => a.blk.t > b.blk.t ? -1 : 1)]
    welcome(res, template)
    document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
  })
}

var helpHTML = function() {
  var text = "<br><br><div>COMMANDS</div><br>"
  text += "<div>/logout - switch your paymail.</div>"
  text += "<div>/credits - demo application credits.</div>"
  text += "<div>/mute - toggle the chat sound on/off</div>"
  text += "<div>/list - list available channels</div>"
  text += "<div>/join #channel - joins a channel by name</div>"
  return text + "<div>/help - this message.<br><br><br>"
}

const B_PREFIX = `19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut`;
const MAP_PREFIX = `1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5`;
