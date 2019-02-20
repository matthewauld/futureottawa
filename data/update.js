var request = require('request');
var Ward    = require('../models/ward')
var logger  = require('../config/winston')
var mongoose          = require('mongoose')

var uri = process.env.MONGO_URI
mongoose.connect(uri+'/futureottawa')


function updateWards(){
  var link ="http://data.ottawa.ca/dataset/8321248d-0b86-47cd-9c83-c848a1bc0098/resource/1b6112e5-3fe6-4976-8c8e-401a35d529a7/download/wards-2014shp.json"
   request(link, function(error, response,body){
    if(error){
      logger.error("ERROR: "+error)
      return
    }
    var data = JSON.parse(body)
    for(let w of data.features){
      Ward.update({"properties.WARD_NUMBE":w.properties.WARD_NUMBE},w,{upsert: true},function(error,r){
        console.log(r)
        if(error){
          logger.error(error)
        }
      })
    }
  })
}


updateWards()
