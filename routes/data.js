var express       = require('express');
var router        = express.Router();
var PlanningApp   = require('../models/planningapp')
var logger        = require('../config/winston')

router.get('/planningapplication/:id',function(req, res, next){
  PlanningApp.findOne({"_id":req.params.id}).then((app)=>{
    if(app){
      res.render('applicationDetail',app.properties)
    } else {
      var e = new Error('Applicaton not found.')
      e.status = 404;
      next(e)
    }
  }
).catch((err)=>{
    logger.error(err)
    err.status = 406
    next(err)
  })
})

module.exports = router;
