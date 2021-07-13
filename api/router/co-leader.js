const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
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
    const makeAdminCollection = client.db("creative-agency").collection("webCoLeader");
    router.get('/', (req, res ,next) => {
        makeAdminCollection.find({})
          .toArray((err, document) => {
            res.send(document)
          })
      })
    router.post('/makeAdmin', (req, res) => {
        const email = req.body.email;
        const name =req.body.name
        makeAdminCollection.insertOne({ email: email, name: name })
          .then(result => {
            res.send(result.insertedCount > 0)
          })
      })
    router.post('/', (req, res ,next) => {
        const email = req.body.email
       //  console.log(email)
         makeAdminCollection.find({email:email})
           .toArray((err, document) => {
             res.send(document.length > 0)
           })
       })
       router.delete('/', (req, res ,next) => {
        const deleteId = req.body.deleteId;
        makeAdminCollection.deleteOne({ _id: ObjectId(deleteId) })
          .then((err, result) => {
            res.send(result)
          })
      })
});
module.exports = router
