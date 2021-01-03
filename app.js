const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const qs = require('querystring')
require('dotenv').config()
const serviceAccount = require("./spotify-mixer-7dff8-firebase-adminsdk-1nxb7-33f2871a10.json")
const app = express()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')  
})

app.post('/token', (req, res) => {
    const spotifyID = req.body.spotifyID;
    const uid = `${spotifyID}`;
    admin
        .auth()
        .createCustomToken(uid)
        .then((customToken) => {
            res.send({firebaseToken: customToken})
        })
        .catch((error) => {
            console.log('Error creating token: ', error)
        })
})

app.post('/spotify/token', async (req, res) => {
    const code = req.body.code
    const requestBody = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,   
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
    }
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const url = "https://accounts.spotify.com/api/token"
    axios.post(url, qs.stringify(requestBody), config).then(spotifyRes => {
        res.send(spotifyRes.data)
    }).catch((err) => {
        if (err.status_code)
            res.status(err.status_code).send(err)
        else 
            res.status(500).send(err)
    })
})

app.post('/spotify/token/refresh', (req, res) => {
    const refreshToken = req.body.refresh_token
    const requestBody = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,   
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    }
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const url = "https://accounts.spotify.com/api/token"
    axios.post(url, qs.stringify(requestBody), config).then(spotifyRes => {
        res.send(spotifyRes.data)
    }).catch((err) => {
        if (err.status_code)
            res.status(err.status_code).send(err)
        else 
            res.status(500).send(err)
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`spotify-mixer-auth listening at http://localhost:${port}`)
})