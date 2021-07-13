const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const router = express.Router()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsgbd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json())
app.use(cors());
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const reviewCommentCollection = client.db("creative-agency").collection("reviewComment");
    router.post('/add', (req, res) => {
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
      router.get('/', (req, res) => {
        reviewCommentCollection.find({})
          .toArray((err, documents) => {
            res.send(documents)
          })
      })
      router.post('/', (req, res) => {
        const id = req.body.id
        reviewCommentCollection.find({ id:id })
          .toArray((err, documents) => {
            res.send(documents.length > 0)
          })
    
    
      })
});
module.exports = router
