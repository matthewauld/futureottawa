var express       = require('express');
var router        = express.Router();
var Ward          = require('../models/ward')
var PlanningApp          = require('../models/planningapp')
var logger        = require('../config/winston')

router.get('/', function(req, res, next){
  res.render('index',{title:'Future Ottawa'})
})

router.get('/map/', function(req,res,next){
  console.log("CALLED MAP!!!")
  if (req.query.dataset == 'wards'){
    Ward.getAllWards(function(err, docs){
      if(err){
        logger.error(err)
        err.status = 406; next(err);
      } else {
        res.contentType('json');
        res.send({"layer":docs})
      }
    })
  } else if(req.query.dataset ==  'planningApps'){
      Promise.all([PlanningApp.getAllPlanningApps, PlanningApp.getAppTypes, PlanningApp.getStatusTypes]).then(([docs, appTypes, statusTypes])=>{
        res.contentType('json');
        res.send(JSON.stringify({"layer": docs, "appTypes": appTypes, "statusTypes":statusTypes}))
      }).catch((err)=>{
        logger.error(err)
        err.status = 406;next(err);
      })
  }
})


module.exports = router;
