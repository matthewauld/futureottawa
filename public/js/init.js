

var mapdata = {
  wards:{visible:false,layer:null,popup:wardPopup},
  planningApps:{visible:false,layer:null,popup:planningAppPopup}
}
var map = L.map('map',{zoomControl:false}).setView([45.4215, -75.6972], 13);
//add and remove functions
function wardPopup(layer){return layer.feature.properties.NAME;}
function planningAppPopup(layer){console.log(layer.feature);return layer.feature.properties['Application #'];}

//initalizers
document.addEventListener('DOMContentLoaded', function() {
  //init materialize
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
  //init collapsible
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems);
  //init selectors
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);







  M.AutoInit();
  //init map
  initMap()
  //layer functionality
  document.getElementById("show_wards").onclick = ()=>{console.log("ASDASDAS");toggleLayer('wards')}
  document.getElementById("show_planningApps").onclick = ()=>{console.log("ASDASDAS");toggleLayer('planningApps')}
})

function timestamp(str) {
    return new Date(str).getTime();
}

function initMap() {
	// set up the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
}


function applyFilter(layerName, filter_criteria){
  if(mapdata[layerName].layer && mapdata[layerName].layer.options.filter === filter_criteria){
    return
  }
  let data = mapdata[layerName].layer.toGeoJSON()
  mapdata[layerName].layer.removeFrom(map)
  mapdata[layerName].layer = L.geoJSON(data,{filter:filter_criteria}).bindPopup(mapdata[layerName].popup)
  mapdata[layerName].layer.addTo(map)
}

//turn layer on or off
function toggleLayer(layerName){
  if(mapdata[layerName].visible === true){
    document.getElementById("show_"+layerName+"_check").removeAttribute("checked")

    mapdata[layerName].layer.removeFrom(map)
    mapdata[layerName].visible = false
  } else {
    document.getElementById("show_"+layerName+"_check").setAttribute("checked", "checked")
    mapdata[layerName].visible = true

    //if layer hasn't been loaded yet
    console.log("layername: "+layerName)
    console.log(!mapdata[layerName].layer)
    if(!mapdata[layerName].layer){
      console.log("ASDASD")
      var xhr = new XMLHttpRequest();
      xhr.open('GET','map?dataset='+layerName)
      xhr.onload = ()=> {
        if(xhr.status==200){
          let layerData = JSON.parse(xhr.response)
          mapdata[layerName].layer = L.geoJSON(layerData,{}).bindPopup(mapdata[layerName].popup)
        }
        mapdata[layerName].layer.addTo(map)
      }
      xhr.send()
    } else {
      mapdata[layerName].layer.addTo(map)
    }
  }
  return false
}

function filter_applications(){
  console.log(M.FormSelect.getInstance(document.getElementById("app_start_date")).getSelectedValues())
  var start_date = new Date(M.FormSelect.getInstance(document.getElementById("app_start_date")).getSelectedValues()[0])
  var end_date = new Date(M.FormSelect.getInstance(document.getElementById("app_end_date")).getSelectedValues()[0])
  var app_type = M.FormSelect.getInstance(document.getElementById("app_type"))

  var filter = function (app){
    if(app.properties['Date Received'].getFullYear()>= start_date && app.properties['Date Received'].getFullYear()<=end_date && app_type.include(app.properties['Application']) ){
      return true
    }
    return false
  }
  applyFilter('wards', filter)

}
