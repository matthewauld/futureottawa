var express           = require('express')
var path              = require('path')
var winston           = require("./config/winston");
var morgan            = require('morgan')
var cookieParser      = require('cookie-parser')
var bodyParser        = require('body-parser')
var hbs               = require('express-handlebars')
var expressValidator  = require('express-validator')
var Handlebars        = require("handlebars")
var MomentHandler     = require("handlebars.moment")
var session           = require('express-session');
var MongoStore        = require('connect-mongo')(session)
var mongoose          = require('mongoose')

var mongo_uri = process.env.MONGO_URI || 'mongodb://localhost'
mongoose.connect(mongo_uri + '/futureottawa')

//ROUTES
var map = require('./routes/map')
var data = require('./routes/data')

//Date handler
MomentHandler.registerHelpers(Handlebars)

//main app
var app = express()

//STATIC AND ENGINES
app.set('views',path.join(__dirname, 'views'))
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout', layoutsDir:__dirname+ '/views/layouts/'}))
app.set('view engine','hbs')

//LOGGERS
//TODO: Integrate winston and morgan

app.use(morgan('combined'));

//PARSERS
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//validator

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root          = namespace.shift(),
    formParam     = root;

    while(namespace.lenght) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use('/',map)
app.use('/data',data)

module.exports = app;
