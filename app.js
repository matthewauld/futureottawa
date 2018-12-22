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


mongoose.connect('mongodb://localhost/futureottawa')

//ROUTES
var index = require('./routes/index')
var map = require('./routes/map')


//Date handler
MomentHandler.registerHelpers(Handlebars)

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

app.use('/', index);
app.use('/map',map)

module.exports = app;
