var express       = require('express');
var router        = express.Router();
var Ward          = require('../models/ward')
var PlanningApp          = require('../models/planningapp')
var logger        = require('../config/winston')

router.get('/', function(req,res,next){
  console.log("CALLED MAP!!!")
  if (req.query.dataset == 'wards'){
    let data = Ward.getAllWards(function(err, docs){
      if(err){
        logger.error(err)
        err.status = 406; next(err);
      } else {
        var result = docs.map(function(doc){return doc.toJSON()})
        console.log(result)
        res.contentType('json');
        res.send(JSON.stringify(result))
      }
    })
  } else if(req.query.dataset ==  'planningApps'){
    let data = PlanningApp.getAllPlanningApps(function(err,docs){
      if(err){
        logger.error(err)
        err.status = 406;next(err);
      } else {
        var result = docs.map(function(doc){return doc.toJSON()})
        console.log(result)
        res.contentType('json');
        res.send(JSON.stringify(result))
      }
    })
  }
})


module.exports = router;
