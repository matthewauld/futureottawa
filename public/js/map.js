

var mapdata = {
  wards:{visible:false,data:null,layer:null,popup:wardPopup,filter:function(app){return true}},
  planningApps:{visible:false,data:null,layer:null,popup:planningAppPopup,filter:function(app){return true}}
}
var map = L.map('map',{zoomControl:false}).setView([45.4215, -75.6972], 13);
//add and remove functions

function wardPopup(layer){
  return makePopup(layer.feature.properties, {'title':layer.feature.properties['WARD_NAME_'], 'fields':{"Number":"WARD_NUM","Councillor":"COUNCILLOR"}} )}
function planningAppPopup(layer){
  return makePopup(layer.feature.properties,{'title':layer.feature.properties['Application #'], link: "/data/planningapplication/"+layer.feature._id, fields:{"Description":"Description","Address":"Address","Type":"Application","Date Received":"Date Received","Status":"status"}})
}



//initalizers
document.addEventListener('DOMContentLoaded', function() {
  //init materialize
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
  //init collapsible
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems);
  // DONT set init selectors, do it on creation
  //var elems = document.querySelectorAll('select');
  //var instances = M.FormSelect.init(elems);
  //init datepicker
  var elems = document.querySelectorAll('.datepicker');
  var options = {container:'body', showClearBtn:true, onSelect:filterApplications}
  var instances = M.Datepicker.init(elems,options);





  //M.AutoInit();
  //init map
  initMap()
  //layer functionality
  document.getElementById("show_wards").onclick = ()=>{toggleLayer('wards')}
  document.getElementById("show_planningApps").onclick = ()=>{toggleLayer('planningApps')}
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
  console.log("applying filter")
  let data = mapdata[layerName].data
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
    if(!mapdata[layerName].data){
      var xhr = new XMLHttpRequest();
      xhr.open('GET','map?dataset='+layerName)
      xhr.onload = ()=> {
        if(xhr.status==200){
          var data = JSON.parse(xhr.response)
          var layerData = data.layer
          mapdata[layerName].data = layerData
           mapdata[layerName].layer = L.geoJSON(layerData,{filter:mapdata[layerName].filter}).bindPopup(mapdata[layerName].popup)
        }
        mapdata[layerName].layer.addTo(map)
        //deal with layer specific tasks
        if(layerName === "planningApps"){
          console.log("YEAH")
          loadPlanningAppSelectors(data)
        }
      }
      xhr.send()
    } else {
      mapdata[layerName].layer.addTo(map)
    }
  }
  return false
}

function filterApplications(){
  var start_date = M.Datepicker.getInstance(document.getElementById("app_start_date")).date
  var end_date = M.Datepicker.getInstance(document.getElementById("app_end_date")).date
  var app_type = M.FormSelect.getInstance(document.getElementById("app_type")).getSelectedValues()
  var status_type = M.FormSelect.getInstance(document.getElementById("app_status")).getSelectedValues()

  console.log("Start Date: " +start_date)
  console.log("End Date: " +end_date)

  var filter = function (app){
    let latest_status = app.properties["status"][app.properties["status"].length -1]["type"]
    if((new Date(app.properties['Date Received'])>= start_date || !start_date) && (new Date(app.properties['Date Received'])<=end_date || !end_date) && app_type.includes(app.properties['Application']) && status_type.includes(latest_status)){
      return true

    }
    return false
  }
  applyFilter('planningApps', filter)

}


function loadPlanningAppSelectors(data){
 M.FormSelect.init(initializeSelect(document.getElementById("app_type"), data.appTypes))
 M.FormSelect.init(initializeSelect(document.getElementById("app_status"), data.statusTypes))

}

function initializeSelect(sel,options){
  for(let elem of options){
    let opt = document.createElement("option")
    opt.selected = true
    opt.text = elem
    opt.value = elem
    sel.add(opt)
  }
  return sel
}

function makePopup(object, mapping){
  var result = ''
  var link = ''
  var title = ''
  if(mapping.title)
     title = `<h4>${mapping.title}</h4>`
  if(mapping.link)
     link = `<a href="${mapping.link}">more info</a>`
  if(mapping.fields){
    var keys = mapping.fields
  } else {
    var keys = object
  }

  for(var field in keys){
    if(keys.hasOwnProperty(field)){
      var key = keys[field]
      value = makeDOM(object[key])
      result = result + `<tr><td>${field}</td><td>${value}</td></tr>`
    }
  }
  return `<div class="map-popup">${title}<table>${result}</table>${link}</div>`
}

function makeDOM(data){
  var result = ''
  if(Array.isArray(data)){
    for(let element of data){
      result += `<div>${makeDOM(element)}</div>`
    }

  } else if(typeof data === 'object'){
    var list = []
    for(var property in data){
      if (data.hasOwnProperty(property)){
        list.push(makeDOM(data[property]))
      }
    }
    result = `<div>${list.join(' | ')}</div>
    `
  } else if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)){
    result = (new Date(data)).toDateString()
  } else {
    result = data
  }
  return result
}
