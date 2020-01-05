var ADDR = "1GYZ4qt5RPhhjDUH2xtWH772n38hqCU3iC"
var protocol = "1CfUB3C5Mwa2Toi7r9tgvQCCe4cjjLmc1B"

var isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)

var query = {
  "v": 3,
  "q": {
    "find": {
      //"in.e.a": ADDR,
      "out.b0": { "op": 106 },
      "out.s1": protocol
    },
    "limit": 200
  },
  "r": {
    "f": "[.[] | { m: .out[0].s2, t: .timestamp, h: .tx.h }]"
  }
}
var sock = {
  "v": 3,
  "q": {
    "find": {
      //"in.e.a": ADDR,
      "out.b0": { "op": 106 },
      "out.s1": protocol
    }
  },
  "r": {
    "f": "[.[] | { m: .out[0].s2, t: .timestamp, h: .tx.h }]"
  }
}
var balance
var apiUrl = 'https://us-central1-bitchat-9926b.cloudfunctions.net'
//var audio = new Audio("https://bitchat.bitdb.network/newmessage.mp3")
var query_b64 = btoa(JSON.stringify(query))
var sock_b64 = btoa(JSON.stringify(sock))
var query_url = 'https://chronos.bitdb.network/q/1P6o45vqLdo6X8HRCZk8XuDsniURmXqiXo/'+query_b64
var socket_url = 'https://chronos.bitdb.network/s/1P6o45vqLdo6X8HRCZk8XuDsniURmXqiXo/'+sock_b64
var bitsocket

//Load audio
//audio.load()

// template
document.addEventListener("DOMContentLoaded", function(e) {

  document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()
    var username = localStorage.getItem('username')
    if (username) {
      // chat
      var chat = document.querySelector("#chat")
      var timestamp = parseInt(Date.now()/1000)
      var message = chat.value.trim()
      if (message === "/refill") {
        chat.value = ""
        refill()
        return
      } else if (message === "/balance") {
        chat.value = ""
        refill()
        return
      } else if (message === '/credits') {
        let html = "<br><div>CREDITS</div><br>"
        html += "<div>Funded via Faucet Bot API from <a href='https://allaboardbitcoin.com'>AllAboard.cash</a>.</div>"
        html += "<div>Powered by <a href='https://bitdb.network'>Bitdb.network</a> & <a href='https://bitsocket.org'>Bitsocket.org</a>, and the Bitcoin SV Blockchain.</div>"
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        return
      } else if (message === '/help') {
        let html = helpHTML()
        let row = document.createElement("div")
        row.className = "refill"
        row.innerHTML = html
        document.querySelector(".container").appendChild(row)
        chat.value = ""
        return
      } else if (message === '/logout') {
        localStorage.removeItem('username')
        window.location.reload(true);
        return
      } else if (message.trim().length === 0) {
        alert("No blank messages")
        return
      }
      message = username + ": " + message
      /*
      if (/[^\x00-\x7F]+/.test(message)) {
        alert("Please only use English alphabet")
        return
      }
      */
      chat.value = ""
      var i = document.querySelector("#chat")
      i.setAttribute("placeholder", "Posting...")
      i.setAttribute("readonly", "readonly")

      let params = {
        data :`["`+ protocol +`", "`+ message +`"]`
      }

      const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
      }).join('&')

      fetch(apiUrl + '/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'omit',
        body: searchParams //, t: timestamp
      }).then(function(res) {
        res.json().then(function(json) {
          console.log("Sent", json)
          let txid = json.txid
          ADDR = json.address
          i.removeAttribute('readonly')
          i.removeAttribute('placeholder')
        })
      })
    } else {
      // login
      var chat = document.querySelector("#chat")
      var username = chat.value.trim()
      localStorage.setItem('username', username)
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
    if (res.type === 't') {
      //audio.play()
      var i = document.querySelector("#chat")
      i.setAttribute("placeholder", "")
      i.removeAttribute("readonly")
      data.m = data.m.trim()
      data.timestamp = moment(data.t).format('M/D, h:mm:ss a');
      var html = template2(data)
      var d = document.createElement("div")
      d.innerHTML = html
      d.className = "row"
      document.querySelector(".container").appendChild(d)

      if (bottom()) {
        document.querySelector(".container").scrollTop = 100000000
      }
    }
  }

  var username = localStorage.getItem('username')
  if (username) {
    reload(template)
  } else {
    login()
  }
})

var bottom = function() {
  var container = document.querySelector(".container")
  console.log("d.scrollTop=", container.scrollTop)
  console.log("d.clientHeight=", container.clientHeight)
  console.log("d.scrollHeight", container.scrollHeight)
  console.log("sum = ", container.scrollTop + container.clientHeight + 100)
  var isbottom = (container.scrollTop + container.clientHeight + 100 >= container.scrollHeight)
  console.log(isbottom)
  return isbottom
}

var refill = function() {
  updateStatus().then(() => {
    var html = "<canvas id='qr'></canvas><div id='button'></div>"
    html += "<div>!!!! WARNING: This is a Bitcoin SV (BSV) wallet.</div>"
    html += "<div>!!!! Don't send from other coins</div>"
    html += "<div><a href='bitcoin:" + ADDR + "?sv'>bitcoin:" + ADDR + "?sv</a></div>"
    html += ("<div>Current balance: " + (balance * 0.00000001).toFixed(8) + " BSV</div>")
    var row = document.createElement("div")
    row.className = "refill"
    row.innerHTML = html
    document.querySelector(".container").appendChild(row)
    setTimeout(function() {
      var qr = new QRious({
        element: document.getElementById('qr'),
        background: "#62cf72",
        value: ADDR
      })
      qr.size = 200;
      const div = document.getElementById('button')
      moneyButton.render(div, {
        amount: "1",
        to: ADDR,
        currency: "USD",
        type: "tip",
        editable: true,
        onPayment: function (arg) { console.log('onPayment', arg) },
        onError: function (arg) { console.log('onError', arg) }
      })
      document.querySelector(".container").scrollTop = 100000000
    }, 500)
    //audio.play()
  })
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
    headertext += "<div>The public AllAboard Faucet pays for the transactions, so you can just start chatting now!</div>"

    headertext += "<br><br><br><div>Enter the name...</div>"
    document.querySelector(".container").innerHTML = headertext
    document.querySelector(".container").scrollTop = 100000000
    document.querySelector("input[type=text]").focus()
  })
}

var welcome = function(res, template) {
  updateStatus().then(() => {
    var reversed = {
      r: res.t.reverse()
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
      headertext += "Welcome " + localStorage.getItem('username')
      headertext += "<br><br>"
      headertext += "<div>1. Your messages are stored on Bitcoin forever as an OP_RETURN transaction"
      headertext += "<div>2. View each transaction on a block explorer by clicking the timestamp."

      headertext += helpHTML()

      document.querySelector(".container").innerHTML = html + headertext
      document.querySelector(".container").scrollTop = 100000000
      document.querySelector("input[type=text]").focus()
    })
  })
}

var reload = function(template) {
  fetch(query_url, {
    headers: {
      key: "1P6o45vqLdo6X8HRCZk8XuDsniURmXqiXo"
    }
  }).then(function(res) {
    return res.json()
  }).then(function(res) {
    res.t.forEach(function(item) {
      try {
        item.m = item.m.trim()
      } catch (e) {
      }
      item.timestamp = moment(item.t).format('M/D, h:mm:ss a');
    })
    welcome(res, template)

  })
}

var helpHTML = function() {
  var text = "<br><br><div>COMMANDS</div><br>"
  text += "<div>/refill - donate and keep the chat faucet alive.</div>"
  text += "<div>/logout - switch your username.</div>"
  text += "<div>/credits - demo application credits.</div>"
  return text + "<div>/help - this message.<br><br><br>"
}

var updateStatus = function() {
  return fetch(apiUrl + '/status', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    'credentials': 'omit'
  }).then(function(res) {
    res.json().then(function(json) {
      console.log("Got", json)
      balance = json.balance
      ADDR = json.address
    })
  })
}
