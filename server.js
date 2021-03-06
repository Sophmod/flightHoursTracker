const express = require('express');  
const path = require('path'); 
const mongoose = require('mongoose'); 
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const crypto = require('crypto'); 
const router = express.Router();

require('./user'); 
const User = mongoose.model('User'); 

const app = express(); 

let distDir = __dirname + "/dist/";
app.use(express.static(distDir)); 
  
app.use(bodyParser.json());

//Allows access to our database outside of connect method
let db;

//Stores current logged in user for proper collection and data access 
let currentUser = '';

//Database credentials
let dbURI = process.env.MONGODB_URI;

//Connect to database
mongodb.MongoClient.connect(dbURI, (err, database) => {
    db = database;
    if (err) console.log(err);
    console.log('DB connected'); 

    //Create express server 
    app.listen(process.env.PORT || 8080, () => {
        console.log('Express started')
    });
});

//Register a new user
app.post('/app/register', (req, res) => { 
    let newUser = new User ();
    newUser.name = req.body.name;
    newUser.email = req.body.email.toLowerCase();
    
    newUser.setPassword(req.body.password);

    db.collection('users').insertOne(newUser,(err, doc) => {
        if (!err) {
            res.sendStatus(200);
        };
    }); 
});

//Log in user
app.post('/app/login', (req, res) => {
    let username = req.body.email.toLowerCase();
    let password = req.body.password;
    let validated = {
        key: false
    };
   
    let cursor = db.collection('users').find({email: username});
    cursor.toArray((err, results) => {
        if (err) throw err;

        if(!results.length) {
            res.send(validated);
        } else {
            let salt = results[0].salt;
            let hash = crypto.pbkdf2Sync(password, salt, 1000, 512, 'sha512').toString('hex');
            
            if (results[0].hash === hash) {
                validated.key = true;
                res.send(validated);
                currentUser = username; 
            } else {
                res.send(validated);
            }
        }
    });
});

//Logs flight data to DB, under collection with the same name as the user who submitted it.
app.post('/data/log-flight', (req, res) => {
    //Store flight data into local variables
    let newFlightOne = req.body.flightOne;
    let newFlightTwo = req.body.flightTwo;
    let newFlightThree = req.body.flightThree;

    //Store passed boolean to determine if the user logged multiple flight profiles 
    let secondFlightPresent = req.body.secondFlight;
    let thirdFlightPresent = req.body.thirdFlight;

    //Choose's the current logged in user's collection for storing flight data
    let collection = currentUser  

    //Insert the flight into the current user's table of flight data
    db.collection(collection).insertOne(newFlightOne, (err, doc) => {
        if (!err) { 
            res.sendStatus(200);
        } 
    });
 
    //If the user submitted the flight with multiple profiles, log those as well, as separate flights
    if (secondFlightPresent == true) {
        db.collection(collection).insertOne(newFlightTwo, (err, doc) => {});
    };

    if (thirdFlightPresent == true) {
        db.collection(collection).insertOne(newFlightThree, (err, doc) => {});
    };
}); 

//Pulls all flight data from current user's collection of logged flights
app.get('/data/flightLog', (req, res) => {
    let collection = currentUser;

    let cursor = db.collection(collection).find();
    cursor.toArray((err, results) => {
        //Handle errors
        results.sortBy((flight) => { 
            return flight.date.momentObj 
        });
        res.send(results); 
    });
});

//Adds a sortBy function, which uses a Schwartzian Transform, to the Array prototype
(() => {
  if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

  function sb (f) {
    for ( let i = this.length; i; ){
      var o = this[--i];
      this[i] = [].concat(f.call(o,o,i),o);
    };

    this.sort((a,b) => {
      for ( let i=0, len=a.length; i<len; ++i){
        if ( a[i]!=b[i] ) return a[i]<b[i] ? - 1 : 1;
      }
      return 0;
    });

    for ( let i=this.length; i; ){
      this[--i]=this[i][this[i].length-1];
    };
    return this;
  };
})();


//Pulls flight data from a provided date range
app.post('/data/flightlog/range', (req, res) => {
    let collection = currentUser;
    let fromDate = req.body.fromDate.momentObj;
    let toDate = req.body.toDate.momentObj;

    let cursor = db.collection(collection).find({
        "date.momentObj" : {
            $gte: fromDate,
            $lt : toDate
        }
    });

    cursor.toArray((err, results) => {
        results.sortBy((flight) => { 
            return flight.date.momentObj 
        });
        res.send(results);
    });
})



//##Routes for the SPA. Will handle the user refreshing the page, by resending the same page to Angular##
app.get('/sign-up', (req, res) => {
  res.sendFile(distDir);
});

app.get('/landing-menu', (req, res) => {
  res.sendFile(distDir);
});

app.get('/main-menu', (req, res) => {
  res.sendFile(distDir);
});

app.get('/add-flight', (req, res) => {
  res.sendFile(distDir);
});

app.get('/flight-log', (req, res) => {
  res.sendFile(distDir);
});

//#########ERROR HANDLERS ###################

function errorHandle (res, reason, message, code) {
    console.log("Error: " + reason);
    res.status(code || 500).json({'error': message});
}
