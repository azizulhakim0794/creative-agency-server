const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const router = express.Router()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsgbd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json())
app.use(cors());
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("creative-agency").collection("addServices");
    router.get('/',(req, res ,next) => {
      servicesCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        })
    })
    router.get('/:id',(req, res ,next) => {
      const id = req.params.id
      servicesCollection.find({ _id:ObjectId(id) })
        .toArray((err, document) => {
          res.send(document[0])
        })
    })
    router.post('/',(req, res ,next) => {
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
});
module.exports = router
