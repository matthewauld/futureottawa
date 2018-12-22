var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var planningAppSchema = mongoose.Schema({
  "type": String,
  "properties":{
    	"Application #":String,
      "Address":[String],
      "Date Received":Date,
      "Description": String,
      "Name": String,
      "Phone":String,
      "Supporting Documents": [String],
      "appid":String,
      "councillor":String,
      "status":[[String,Date]],
      "ward_name": String,
      "ward_num":String,
      "geometry":{
        "type":{type:String},
        "coordinates":[[[mongoose.Schema.Types.Double]]]
      }

  }
})

var PlanningApp = module.exports=mongoose.model('PlanningApp',planningAppSchema)
module.exports.getAllPlanningApps = function(callback){
  PlanningApp.find(callback)
}
