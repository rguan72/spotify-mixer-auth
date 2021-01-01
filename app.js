const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')
const bodyParser = require('body-parser')
const serviceAccount = require("./spotify-mixer-7dff8-firebase-adminsdk-1nxb7-33f2871a10.json")
const app = express()
const port = 3000

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
    const uid = `spotify:${spotifyID}`;
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

app.listen(port, () => {
  console.log(`spotify-mixer-auth listening at http://localhost:${port}`)
})