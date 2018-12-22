var express       = require('express');
var router        = express.Router();


//MODELS





router.get('/', function(req, res, next){
  res.render('index',{title:'Future Ottawa'})
})

module.exports = router;
