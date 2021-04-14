const express = require('express');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsgbd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json())
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload())

const serviceAccount = require("./creative-agency-5945c-firebase-adminsdk-m5fsj-03a44418e4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const port = 5000;

app.get('/', (req, res) => {
  res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creative-agency").collection("addServices");
  const userOrderCollection = client.db("creative-agency").collection("userSelectOrder");
  const adminCollection = client.db("creative-agency").collection("webLeader");
  const makeAdminCollection = client.db("creative-agency").collection("webCoLeader");
  const reviewCommentCollection = client.db("creative-agency").collection("reviewComment");

  app.post('/addServices', (req, res) => {
    const file = req.files.file;

    const newImg = file.data;
    const encImg = newImg.toString('base64');
    const name = req.body.name;
    const details = req.body.details;
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    servicesCollection.insertOne({ name, details, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })
  app.get('/allServices', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.get('/oneServices/:id', (req, res) => {
    const id = req.params.id
    servicesCollection.find({ _id:ObjectId(id) })
      .toArray((err, document) => {
        res.send(document[0])
      })
  })
  app.post('/addMyOrder', (req, res) => {
    const email = req.body.email;
    const details = req.body.details;
    const orderTime = req.body.orderTime;
    const name = req.body.name;
    const image = req.body.image;
    userOrderCollection.insertOne({ email, details, orderTime, name, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/myOrder', (req, res) => {
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
  app.delete('/orderDelete', (req, res) => {
    const deleteId = req.body.deleteId;
    userOrderCollection.deleteOne({ _id: ObjectId(deleteId) })
      .then((err, result) => {
        res.send(result)
      })
  })
  app.post('/mainLeader', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents.length > 0);
      })
  })
  app.post('/makeAdmin', (req, res) => {
    const email = req.body.email;
    makeAdminCollection.insertOne({ email: email, name: name })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  app.delete('/coAdminDelete', (req, res) => {
    const deleteId = req.body.deleteId;
    makeAdminCollection.deleteOne({ _id: ObjectId(deleteId) })
      .then((err, result) => {
        res.send(result)
      })
  })
  app.get('/AllCoLeader', (req, res) => {
    makeAdminCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.post('/findCoLeader', (req, res) => {
   const email = req.body.email
    makeAdminCollection.find({email:email})
      .toArray((err, document) => {
        res.send(document.length > 0)
      })
  })
  app.get('/dashboard/orderReview/:id', (req, res) => {
    const id = req.params.id;
    userOrderCollection.find({ _id: ObjectId(id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })
  app.post('/reviewComment', (req, res) => {
    const email = req.body.email;
    const name = req.body.userName
    const userImg = req.body.googleImg
    const details = req.body.details
    const orderName = req.body.orderName
    const id = req.body.id
    reviewCommentCollection.insertOne({ email: email, name: name, userImg: userImg, details: details, orderName: orderName, id: id })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/allComment', (req, res) => {
    reviewCommentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  app.post('/reviewFind', (req, res) => {
    const id = req.body.id
    reviewCommentCollection.find({ id:id })
      .toArray((err, documents) => {
        res.send(documents.length > 0)
      })


  })
})

app.listen(process.env.PORT || port)