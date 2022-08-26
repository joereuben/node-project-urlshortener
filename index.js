require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose = require('mongoose');
const dns = require('dns');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let bodyParser = require('body-parser');

//Create a url schema called urlSchema
const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  shortUrl: Number
});

//Create url model from the schema
let URLModel = mongoose.model("URL", urlSchema);

//Use body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  // URLModel.remove({})
  let hostname = ""
  try {
    const urlObject = new URL(req.body.url)
    hostname = urlObject.hostname
  } catch (error) {
    hostname = req.body.url
    console.error(error)
  }
  
  console.log(hostname)
  dns.lookup(hostname, (err, address, family) =>{
    if(err) {
      console.error(err)
      res.json({error: 'invalid url'})
      return 
    }
    console.log("good")
    createAndSaveURL(res, req.body.url)
  })
});

app.get('/api/shorturl/:code', function(req, res) {
  findUrl(res, req.params.code)
  
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const createAndSaveURL = (res, urlString) => {
  URLModel.find({}, (err, data)=>{
    if(err) return console.error("first: "+err);
    // get total documents in collection
    const newShortUrl = data.length + 1
    //now create new url with newshortUrl and save
    var url = new URLModel({url: urlString, shortUrl: newShortUrl});
    url.save(function(err, data) {
      if (err) return console.error("second: "+err);
      console.log("some string2: "+urlString)
      res.json({ original_url: urlString, short_url: newShortUrl });
    });
  })
  
};

const findUrl = (res, code) => {
  URLModel.findOne({shortUrl: code}, (err, data)=>{
    if(err) return console.error(err);
    // get url of object
    if(!data) return res.send("No URL found for "+code)
    
    const urlString = data.url
    res.redirect(urlString)
  })
}
