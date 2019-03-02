// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')

// All HTTPS requests via promises
const rp = require('request-promise')

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin')
admin.initializeApp()

// AllAboard api url endpoint
const apiUrl = 'https://api.allaboard.cash/faucet'

// Name: /push
// Method: POST
// Description: Used to push to the faucet via AllAboard
// Returns: 200 on Success
exports.push = functions.https.onRequest(async (req, res) => {
  let cors = handleCors(req, res)
  try {
    let response = await apiRequest(cors.req, '/push')
    return cors.res.send(response)
  } catch(error) {
    console.error(error.statusCode, error.error)
    return cors.res.status(error.statusCode).send(error.error)
  }
})

// Name: /status
// Method: GET
// Description: Used to get the status of the faucet (address, balance)
// Returns: 200 on Success, JSON body
exports.status = functions.https.onRequest(async (req, res) => {
  let cors = handleCors(req, res)
  try {
    let response = await apiRequest(cors.req, '/status')
    return cors.res.send(response)
  } catch (error) {
    console.error(error.statusCode, error.error)
    return cors.res.status(error.statusCode).send(error.error)
  }
})

// Handle all Cors for OPTION requests and all other requests
const handleCors = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET,POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
  } else {
    res.set('Access-Control-Allow-Origin', '*')
  }
  return {req: req, res: res}
}

// Standard AllAboard API request
const apiRequest = (req, path) => {
  console.log('requesting url: ', apiUrl + path, ' method: ', req.method, ' body: ', req.body, ' form data: ', req.formData, ' ip: ', req.ips[0])

  let headers = {}

  // This is the environment variable that was set via Firebase CLI
  headers.key = functions.config().allaboard.key

  // Send the client IP address (used for limiting via 24 hours)
  headers.ip = req.ips[0]

  let options = {
    headers: headers,
    json: true,
    method: req.method,
    uri: apiUrl + path
  }
  if (req.method === 'POST') {
    options.form = req.body
  }
  return rp(options)
}