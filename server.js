// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Access-Control-Header-Origin middleware

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'API is running!' });   
});


// form submit
// ----------------------------------------------------
router.route('/submit')
   
.post(function(req, res) {

//require Node modules

var https = require('https');
var querystring = require('querystring');

// build the data object

var postData = querystring.stringify({
    'email': req.body.email,
    'firstname': req.body.firstname,
    'lastname': req.body.lastname,
    'hs_context': JSON.stringify({
       "hutk": req.cookies.hubspotutk,
        "ipAddress": req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        "pageUrl": "https://www.phrasingpro.com/api",
        "pageName": "Forms API - Tech Test"
    })
});

// set the post options, changing out the HUB ID and FORM GUID variables.

var options = {
    hostname: 'forms.hubspot.com',
    path: '/uploads/form/v2/1966653/994ca53c-309a-435d-8b5a-205f668f3173',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    }
}

// set up the request

var request = https.request(options, function(response){
    console.log("Status: " + response.statusCode);
    console.log("Headers: " + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(chunk){
        console.log('Body: ' + chunk)
    });
});

request.on('error', function(e){
    console.log("Problem with request " + e.message)
});

// post the data

request.write(postData);
request.end();

res.json({message: res.statusCode});
}); 


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server is running on port ' + port);
