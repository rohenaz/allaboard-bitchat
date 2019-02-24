// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')
const rp = require('request-promise')

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin')
admin.initializeApp()

const allaboardUrl = 'https://api.allaboard.cash/faucet'

exports.push = functions.https.onRequest(async (req, res) => {
    let cors = handleCors(req, res)
    try {
        let response = await requestWrap(cors.req, '/push')
        return cors.res.send(response)
    } catch(error) {
        console.error(error)
        return cors.res.status(500).send('Something went wrong while sending to allaboard.')
    }
  })

exports.status = functions.https.onRequest(async (req, res) => {
    let cors = handleCors(req, res)

    try {
        let response = await requestWrap(cors.req, '/status')
        return cors.res.send(response)
    } catch(error) {
        console.error(error)
        return cors.res.status(500).send('Something went wrong while sending to allaboard.')
    }
})

const handleCors = (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')

    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'GET')
      res.set('Access-Control-Allow-Headers', 'Content-Type')
      res.set('Access-Control-Max-Age', '3600')
      res.status(204).send('')
    } else {
      // Set CORS headers for the main request
      res.set('Access-Control-Allow-Origin', '*')
    }
    return {req: req, res: res}
}

const requestWrap = (req, path) => {
    console.log('hitting url:', allaboardUrl + path, 'with method:', req.method, 'and body:', req.body, 'form data?', req.formData)
    let headers = {}
    headers.key = functions.config().allaboard.key

    let options = {
        headers: headers,
        method: req.method,
        uri: allaboardUrl + path,
        json: true
      }
      if (req.method === 'POST') {
        options.form = req.body
      }
      console.log('using options', options)
    return rp(options)
}