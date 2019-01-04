var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var planningAppSchema = mongoose.Schema({
  "type": String,
  "_id": mongoose.Schema.Types.ObjectId,
  "properties":{
    	"Application #":String,
      "Address":[String],
      "Date Received":Date,
      "Description": String,
      "Name": String,
      "Phone":String,
      "Supporting Documents": [String],
      "appid":String,
      "Application": String,
      "councillor":String,
      "status":[{"type":{type:String}, "date":{type:Date}}],
      "ward_name": String,
      "ward_num":String,
      "geometry":{
        "type":{type:String},
        "coordinates":[[[mongoose.Schema.Types.Double]]]
      }

  }
})

var PlanningApp = module.exports=mongoose.model('PlanningApp',planningAppSchema)

module.exports.getAllPlanningApps = PlanningApp.find()


module.exports.getStatusTypes = PlanningApp.distinct('properties.status.type')

module.exports.getAppTypes = PlanningApp.distinct('properties.Application')
