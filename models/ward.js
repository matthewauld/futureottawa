var mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var wardSchema = mongoose.Schema({
  "type": String,
  "properties":{
     "DESCRIPTIO":String,
     "NAME":String,
     "NAME_FR":String,
     "WARD_NUM":String,
     "WARD_EN":String,
     "WARD_FR":String,
     "COUNCILLOR":String,
     "WARD_NAME_":String,
     "WARD_NAME1":String,
     "WARD_NUMBE":Number,
     "SHAPE_Leng":mongoose.Schema.Types.Double,
     "SHAPE_Area":mongoose.Schema.Types.Double
  },
  "geometry":{
    "type":{type:String},
    "coordinates":[[[mongoose.Schema.Types.Double]]]
  }

})

var Ward = module.exports=mongoose.model('Ward',wardSchema)

module.exports.getAllWards = function(callback){
  Ward.find(callback)
}
