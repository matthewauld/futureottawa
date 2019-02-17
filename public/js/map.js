var map = L.map('map',{zoomControl:false}).setView([45.4215, -75.6972], 13);
var layers = {}
var layerTemplates = {
                      planningApps:{
                                    popup:{'title':'Application #', link: "/data/planningapplication/", fields:{"Description":"Description","Address":"Address","Type":"Application","Date Received":"Date Received","Status":"status"}},
                                    selectors:{id:"planningAppsSelector",fields:[{name:"start_date",type:"datepicker",class:"datepicker",displayName:"Start Date"},{name:"end_date",type:"datepicker",class:"datepicker",displayName:"End Date"},{default:"all",name:"Application",type:"select-multiple",displayName:"Application Type"},{default:"all",name:"latest_status",type:"select-multiple",displayName:"Current Status"}]},
                                    filter: function(app ,selectors){
                                      var start_date = selectors.start_date.value
                                      var end_date = selectors.end_date.value
                                      var app_type = selectors.Application.value
                                      var status_type = selectors.latest_status.value


                                      if((new Date(app.properties['Date Received'])>= start_date || !start_date) && (new Date(app.properties['Date Received'])<=end_date || !end_date) && app_type.includes(app.properties['Application']) && status_type.includes(app.properties['latest_status'])){
                                        return true
                                    } else {
                                      return false
                                    }
                                  }
                    },
                      wards:{popup:{'title':'WARD_NAME_', 'fields':{"Number":"WARD_NUM","Councillor":"COUNCILLOR"}}}
                    }
//initalizers
document.addEventListener('DOMContentLoaded', function() {
  //init materialize
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
  //init collapsible
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems);


  document.getElementById("show_wards").onclick = ()=>{toggleLayer('wards')}
  document.getElementById("show_planningApps").onclick = ()=>{toggleLayer('planningApps')}
  initMap()
})

  function initMap() {
  	// set up the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

    //Inialize layers based on cookies, if they exist
    for(layer in layerTemplates){

      if(layerTemplates.hasOwnProperty(layer)){
        var cookie = Cookies.getJSON(layer)
        if(cookie.visible){
          toggleLayer(layer)
          var elems = document.getElementById(layer+"Collapser")
          if(elems){
            var instance = M.Collapsible.getInstance(elems);
            instance.open()
          }
        }
      }
    }

  }

function toggleLayer(layerName){
  if(layers[layerName]){
    layers[layerName].toggleLayer()
    if(layers[layerName].visible){
      document.getElementById("show_"+layerName+"_check").setAttribute("checked", "checked")
    } else {
      document.getElementById("show_"+layerName+"_check").removeAttribute("checked")
    }
    return
  }
  var xhr = new XMLHttpRequest()
  xhr.open('GET','map?dataset='+layerName)
  xhr.onload = ()=> {
    if(xhr.status==200){
      var data = JSON.parse(xhr.response)
      layers[layerName] = new DataLayer(layerName,map,data.layer)
      if(layerTemplates[layerName].selectors){
        layers[layerName].createSelectors(layerTemplates[layerName].selectors.id,layerTemplates[layerName].selectors.fields)
      }
      layers[layerName].setPopup(layerTemplates[layerName].popup)
      if(layerTemplates[layerName].filter){
        layers[layerName].setFilter(layerTemplates[layerName].filter)
      }
      layers[layerName].toggleLayer()
      document.getElementById("show_"+layerName+"_check").setAttribute("checked", "checked")
      //inialize materialize componants
      M.FormSelect.init(document.querySelectorAll('select'))
      var elems = document.querySelectorAll('.datepicker');
      var options = {container:'body', showClearBtn:true}
      var instances = M.Datepicker.init(elems,options);
    }

  }
  xhr.send()

}
