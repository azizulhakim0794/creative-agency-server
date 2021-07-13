const express = require('express');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsgbd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json())
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload())

const port = 5000;
const serviceRouter = require('./api/router/services')
const userOrderRouter = require('./api/router/userOrder')
const coLeaderRouter = require('./api/router/co-leader')
const reviewComment = require('./api/router/reviewComment')

app.get('/', (req, res) => {
  res.send("hello from db it's working working")
})
app.use('/services',serviceRouter)
app.use('/dashboard',userOrderRouter)
app.use('/coLeader',coLeaderRouter)
app.use('/reviewComment',reviewComment)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const adminCollection = client.db("creative-agency").collection("webLeader");
  app.post('/mainLeader', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents.length > 0);
      })
  })
})

app.listen(process.env.PORT || port)