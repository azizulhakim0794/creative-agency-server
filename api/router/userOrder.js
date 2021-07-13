const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config()
const router = express.Router()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsgbd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json())
app.use(cors());
const serviceAccount = require("../../creative-agency-5945c-firebase-adminsdk-m5fsj-03a44418e4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const userOrderCollection = client.db("creative-agency").collection("userSelectOrder");
    router.post('/userOrderAdd', (req, res ,next) => {
      const email = req.body.email;
      const details = req.body.details;
      const orderTime = req.body.orderTime;
      const userName = req.body.userName;
      const orderName = req.body.orderName;
      const orderImg = req.body.orderImg;
      const userImg = req.body.userImg
      const states = req.body.states
      const btnColor = req.body.btnColor
      userOrderCollection.insertOne({ email, details, orderTime, userName, orderName,orderImg, userImg ,states,btnColor})
        .then(result => {
          res.send(result.insertedCount > 0)
        })
      })
      router.get('/allUserOrder', (req, res ,next) => {
        const id = req.params.id;
        userOrderCollection.find({})
          .toArray((err, documents) => {
            res.send(documents);
          })
      })
      router.post('/userOrder', (req, res ,next) => {
        const email = req.body.email;
        const uid = req.body.uid
        const bearer = req.headers.authorization
        if(bearer && bearer.startsWith('Bearer ')){
          const idToken = bearer.split(' ')[1]
          admin
          .auth()
          .verifyIdToken(idToken)
          .then((decodedToken) => {
            if(decodedToken.uid === uid){
              userOrderCollection.find({ email: email })
              .toArray((err, documents) => {
                res.send(documents);
              })
            }
            else{
              res.send('unauthorized access')
            }
          })
          .catch((error) => {
            // Handle error
          });
        }
        else{
          res.status(401).send('unauthorized access')
        }
    
    
    
      })
      router.delete('/userOrderDelete', (req, res ,next) => {
        const deleteId = req.body.deleteId;
        userOrderCollection.deleteOne({ _id: ObjectId(deleteId) })
          .then((err, result) => {
            res.send(result)
          })
      })
      router.get('/orderReview/:id', (req, res) => {
        const id = req.params.id;
        userOrderCollection.find({ _id: ObjectId(id) })
          .toArray((err, documents) => {
            res.send(documents[0]);
          })
      })
      router.patch('/statesUpdate/:id', (req, res) => {
        const id = req.params.id;
        const states = req.body.states
        const btnColor = req.body.btnColor
        userOrderCollection.updateOne({ _id: ObjectId(id) },
        {
          $set:{'states':states , 'btnColor':btnColor}
        })
        
        .then((err, result) => {
          res.send(result)
        })
      })
      router.get('/userOrder/:id', (req, res ,next) => {
        const id = req.params.id;
        userOrderCollection.find({ _id: ObjectId(id) })
          .toArray((err, documents) => {
            res.send(documents[0]);
          })
      })
});
module.exports = router
