var isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)

var queryChannels = {
  "v": 3,
  "q": {
    "aggregate": [
      {
        "$match": {"MAP.type": "message" }
      },
      {
        "$sort": { "blk.t": 1 }
      },
      {
        "$group": {
          "_id": "$MAP.channel",
          "channel": { "$first": "$MAP.channel" },
          "creator": { "$first": "$MAP.paymail" },
          "last_message": { "$last": "$B.content" },
          "last_message_time": { "$last": "$timestamp" },
          "messages": { "$sum": 1 }
        }
      }
    ],
    "sort": { "last_message_time": -1 },
    "limit": 100
  }
}

var balance

var audio = new Audio("https://bitchat.allaboardbitcoin.com/audio/notify.mp3")

var queryChannelsB64 = btoa(JSON.stringify(queryChannels))
var queryChannelsUrl = 'https://b.map.sv/q/'+queryChannelsB64
var bitsocket

// music player
var player = new Audio()
var collection = []
// channels
var channels = []
var verboseMode = false

// Load audio
audio.load()

// get window query params, set channel context if needed
const searchParams = new URLSearchParams(window.location.search);

// template
document.addEventListener("DOMContentLoaded", function(e) {
  audio.volume = 0.25
  const initMuted = localStorage.getItem('bitchat.muted')
  const initVerbose = localStorage.getItem('bitchat.verbose')
  verboseMode = initVerbose === 'true'
  audio.muted = initMuted === 'true'
  var paymail = localStorage.getItem('bitchat.paymail')

  var query_b64 = btoa(JSON.stringify(query(verboseMode)))
  var query_url = 'https://b.map.sv/q/'+query_b64
  var sock_b64 = btoa(JSON.stringify(sock(verboseMode)))
  var socket_url = 'https://b.map.sv/s/'+sock_b64


  document.querySelector("form").addEventListener("submit", async function(e) {
    e.preventDefault()
    e.stopPropagation()

    if (paymail) {
      // chat
      var chat = document.querySelector("#chat")
      var timestamp = parseInt(Date.now()/1000)
      var message = chat.value.trim()
      if (message.toLowerCase() === "/balance") {
        chat.value = ""
        refill()
        return
      } else if (message.toLowerCase() === '/credits') {
        let html = "<br><div>CREDITS</div><br>"
        // html += "<div>Funded via Faucet Bot API from <a href='https://allaboardbitcoin.com'>AllAboard.cash</a>.</div>"
        html += "<div>Powered by <a href='https://b.map.sv'>b.map.sv</a>, <a href='https://bitcoinschema.org'>BitcoinSchema.org</a>, <a href='https://allaboardbitcoin.com'>AllAboardBitcoin.com</a>, <a href='https://junglebus.gorillapool.io'>JungleBus</a> & the Bitcoin SV Blockchain.</div>"
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        return
      } else if (message.toLowerCase().startsWith('/play')) {

        // play random songs from your NFT collection

        // get the collection

        // group them by origin

        return
      } else if (message.toLowerCase() === '/back' || message.toLowerCase() === 'cd ..') {
        window.location.href = 'https://bitchat.allaboardbitcoin.com'
        return
      } else if (message.toLowerCase().startsWith('/join ') || message.toLowerCase().startsWith('/j ') || message.toLowerCase().startsWith('cd ')) {
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
      } else if (message.toLowerCase() === 'ls' || message.toLowerCase() === 'dir' ||message.toLowerCase() === '/list' || message.toLowerCase() === '/channels') {

        let html = "<br><div>CHANNELS</div><br>"
        let row = document.createElement("div")
        fetch(queryChannelsUrl).then(function(res) {
          return res.json()
        }).then((res) => {
          channels = (res.c || []).filter(c => !!c.channel).map(c => c.channel)
          console.log({ channels })
          res.c.forEach(function (c) {
            if (c.channel) {
              html += `<div>#${c.channel} (${c.messages})</div>\n`
            }
          })
          
          row.className = "refill"
          row.innerHTML = html
          document.querySelector(".container").appendChild(row)
          chat.value = ""
          if (!audio.muted) {
            audio.play()
          }
          
          document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
        })
        
        return
      } else if (message.toLowerCase() === '/mute') {
        localStorage.setItem('bitchat.muted', !audio.muted ? 'true' : 'false')
        let html = `<br><div>AUDIO ${ audio.muted ? 'UNMUTED' : 'MUTED'}</div><br>`

        audio.muted = !audio.muted

        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
        
        if (!audio.muted) {
          audio.play()
        }
        return
      } else if (message.toLowerCase() === '/v' || message.toLowerCase() === '/verbose') {
        localStorage.setItem('bitchat.verbose', !verboseMode ? 'true' : 'false')
        let html = `<br><div>VERBOSE MODE ${ !verboseMode ? 'ON' : 'OFF'}</div><br>`
        
        verboseMode = !verboseMode

        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
        
        if (!audio.muted) {
          await audio.play()
        }
        window.location.reload(true, query_url)
        return
      } else if (message.toLowerCase() === '/help') {
        let html = helpHTML()
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        document.querySelector('.container').scrollTop = document.querySelector('.container').scrollHeight
        
        return
      } else if (message.toLowerCase() === '/logout') {
        localStorage.removeItem('bitchat.paymail')
        // TODO: log out of relay (doesn't work) - relay doesn't support this endpoint
        // var win = window.open('http://relayx.com/logout','_blank','width=800,height=600,status=0,toolbar=0');
        // setTimeout(() => {
        //   win.close()
        //   window.location.reload(true); 
        // }, 5000)
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
          'message',
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
    if (res.type === 'push' && (data.MAP.type === 'message' || verboseMode)) {
      if (!audio.muted) {
        audio.play()
      }
      var i = document.querySelector("#chat")
      i.setAttribute("placeholder", "")
      i.removeAttribute("readonly")
      data.m = `${data.MAP.paymail || data.AIP?.address}: ${Autolinker.link(data.B.content.trim())}`
      data.timestamp = moment(data.blk.t*1000).format('M/D, h:mm:ss a');
      data.h = data.tx.h
      data.url = data.MAP.type === 'post' ? 'https://blockpost.network/post/' : 'https://whatsonchain.com/tx/'
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
    reload(template, query_url)
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
        switch (t.MAP.app) {
          case 'blockpost.network':
            t.url = "https://blockpost.network/post/"
          break;
          case 'twetch':
            t.url = 'https://twetch.com/t/'
            break;
          default:
            t.url = "https://whatsonchain.com/tx/"
            break
        }
        t.h = t.tx.h;
        t.classNames = `${t.MAP.type === 'post' ? 'post' : '' }`
        return t; 
      })
    }
    var header = searchParams.has('c') ? searchParams.get('c') : "Bitchat"
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
      headertext += `Welcome ${searchParams.has('c') ? 'to #' + searchParams.get('c') : ''} ${localStorage.getItem('bitchat.paymail')}`
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

var reload = function(template, query_url) {
  fetch(query_url).then(function(res) {
    return res.json()
  }).then(function(res) {
    res.c.forEach(function(item) {
      try {
        item.m = `${item.MAP.paymail || item.AIP.address}: ${Autolinker.link(item.B.content.trim())}`
      } catch (e) {
      }
      item.timestamp = moment(item.blk.t*1000).format('M/D, h:mm:ss a');
    })
    res.c = [...res.c.filter((c) => c.MAP.type === 'message' || verboseMode).sort((a, b) => a.blk.t > b.blk.t ? -1 : 1)]
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
  text += "<div>/back - returns to global channel</div>"
  text += "<div>/verbose - toggle verbose mode (show posts)</div>"
  return text + "<div>/help - this message.<br><br><br>"
}

const B_PREFIX = `19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut`;
const MAP_PREFIX = `1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5`;

const query = (verbose) => {
  let q = {
    "v": 3,
    "q": {
      "find": {
        "MAP.type": verbose ? { "$in": ["post","message"] } : "message", 
      },
      "sort": {
        "timestamp": -1,
        "blk.t": -1
      },
      "limit": 100
    }
  }
  if (searchParams.has('c')) {
    q.q.find['MAP.channel'] = searchParams.get('c')
  } else {
    q.q.find['MAP.channel'] = { '$exists': false }
  }
  return q
}

const sock = (verbose) => { 
  let q = {
    "v":3,
    "q":{
      "find":{
        "MAP.type": verbose ? {"$in": ["post","message"]} : "message", 
      }
    }
  }
  if (searchParams.has('c')) {
    q.q.find['MAP.channel'] = searchParams.get('c')
  } else {
    q.q.find['MAP.channel'] = { '$exists': false }
  }
  return q
}