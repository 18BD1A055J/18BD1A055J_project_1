
// Reference: https://zellwk.com/blog/crud-express-mongodb/

const express = require('express');
const bodyParser= require('body-parser')
const app = express();
let server=require('./server');
let middleware=require('./middleware');

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'
const dbName = 'hospitalInventory'
let db

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference 'db' to the database so you can use it later
  db = client.db(dbName)
  const hospitalsCollection = db.collection('hospitals')
  const ventilatorsCollection = db.collection('ventilators')
  app.set('view engine', 'ejs')

  // Make sure you place body-parser before your CRUD handlers!
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static('public'))
  app.use(bodyParser.json())

  // READ
  app.get('/', middleware.checkToken, (req, res) => {
    hospitalsCollection.find().toArray()
    .then(results => {
        res.render('hospitals.ejs', { hospitals: results, heading: 'hospitals' })
    })
    .catch(error => console.error(error))

  })

  app.get('/hospitals', middleware.checkToken, (req, res) => {
    hospitalsCollection.find().toArray()
    .then(results => {
        res.render('hospitals.ejs', { hospitals: results })
    })
    .catch(error => console.error(error))

  })

  app.get('/ventilators', middleware.checkToken, (req, res) => {
    ventilatorsCollection.find().toArray()
    .then(results => {
        res.render('ventilators.ejs', { ventilators: results })
    })
    .catch(error => console.error(error))

  })

  // SEARCH ventilators
  app.get('/searchV', middleware.checkToken, (req, res) => {
    ventilatorsCollection.find( 
        { $or: 
            [ 
                { status: {$regex: req.query.name, $options:"$i"} }, // this searches for a field in our db having req.query.name as its substring 
                { ventilatorId: {$regex: req.query.name, $options:"$i"} } // $options: "$i" is for case-insensitive search
            ]
        }).toArray()
    .then(results => {
        res.render('ventilators.ejs', { ventilators: results })
    })
    .catch(error => console.error(error))
  })

  // SEARCH Hospitals
  app.get('/searchH', middleware.checkToken, (req, res) => {
    hospitalsCollection.find({name: {$regex: req.query.name, $options: "$i"}}).toArray()
        
    .then(results => {
        res.render('hospitals.ejs', { hospitals: results })
    })
    .catch(error => console.error(error))
  })
  
  // CREATE
  app.post('/hosp', middleware.checkToken, (req, res) => {
    hospitalsCollection.insertOne(req.body)
      .then(result => {
        res.redirect('/')
      })
      .catch(error => console.error(error))
  })
    
  app.post('/vent', middleware.checkToken, (req, res) => {
    ventilatorsCollection.insertOne(req.body)
      .then(result => {
        res.redirect('/ventilators')
      })
      .catch(error => console.error(error))
  })

  // Get update page
  app.get('/updatePage/:id', middleware.checkToken, (req, res) => {
    ventilatorsCollection.find({ ventilatorId: req.params.id }).toArray()  
    .then(results => {
        res.render('update.ejs', { ventilatorDetails: results })
    })
    .catch(error => console.error(error))
  })
  
  // UPDATE
  app.put('/update', middleware.checkToken, (req, res) => {
    ventilatorsCollection.findOneAndUpdate(  
        { ventilatorId: req.body.ventilatorId },
        {
            $set: {
                status: req.body.status
            }
        })
        .then(result => {
            res.json("Updated")
        })
        .catch(error => console.error(error))
    })


  // DELETE
  app.get('/delete/:id', middleware.checkToken, (req, res) => {
    ventilatorsCollection.deleteOne(
      { ventilatorId: req.params.id }
    )
    .then(result => {
      res.redirect('/ventilators')
    })
    .catch(error => console.error(error))
  })

  app.listen(3000, function() {
    console.log('listening on 3000')
  })

  
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)
})

