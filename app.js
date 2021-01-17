const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const qs = require('querystring')
require('dotenv').config()
const app = express()

const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
admin.initializeApp({
  credential: admin.credential.cert({
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: private_key,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
    })
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
            console.log('Error creating token: ', error.response.data)
        })
})

app.post('/spotify/token', async (req, res) => {
    const code = req.body.code
    const other_redir = req.body.other_redir
    const requestBody = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,   
        grant_type: "authorization_code",
        code: code,
        redirect_uri: other_redir ? process.env.REDIRECT_URI_AUTHDIR : process.env.REDIRECT_URI,
    }
    console.log(requestBody)
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const url = "https://accounts.spotify.com/api/token"
    axios.post(url, qs.stringify(requestBody), config).then(spotifyRes => {
        res.send(spotifyRes.data)
    }).catch((err) => {
        console.log(err.response)
        if (err.status_code)
            res.status(err.status_code).send(err.response.data)
        else 
            res.status(500).send(err.response.data)
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
        console.log(err.response)
        if (err.status_code)
            res.status(err.status_code).send(err.response.data)
        else 
            res.status(500).send(err.response.data)
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`spotify-mixer-auth listening at http://localhost:${port}`)
})