import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
let cors = require('cors');
let serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://beacons-x.firebaseio.com"
});
  
const db = admin.firestore()

const app = express()
const v1 = express()
const establishmentApi = express()

v1.use('/establishment', establishmentApi)

app.use(cors({ origin: true }))
app.use('/v1', v1)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

export const api = functions.https.onRequest(app);
const establishmentsCollection = db.collection('establishments')

establishmentApi.get('/previews', (request, response) => {
    establishmentsCollection
    .get()
    .then(snapshot => {
        const data = snapshot.docs.map(doc => { 
            const data = doc.data()
            data["establishmentId"] = doc.id
            return data
        })
        response.status(200).send(data)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send(error)
    }) 
})

establishmentApi.get('/beacon-preview/:beaconId', (request, response) => {
    establishmentsCollection
    .where("beacons", "array-contains", request.params.beaconId)
    .get()
    .then(snapshot => {
        const data = snapshot.docs.map(doc => { 
            const data = doc.data()
            data["establishmentId"] = doc.id
            return data
        })

        if (data.length > 0) {
            response.status(200).send(data[0])
        } else {
            response.status(404).send()
        }
    })
    .catch(error => {
        console.log(error)
        response.status(500).send(error)
    }) 
})
