/**
 * Creates a geoJSON data layer.
 * @constructor
 * @param {string} name     - Name of the DataLayer.
 * @param {object} map      - the Leaflet map object
 * @param {object} geoJSON  - the geoJSON data
  * @param {object} geoJSON  - JSON cookie data
 */

function DataLayer (name, map, geoJSON) {
  this.name = name
  this.data = geoJSON
  this.map  = map
  this.cookieData = Cookies.getJSON(this.name)
  this.selectors = {}
  this.filter = function(elem, selector){return true}
  this.visible = false
  this.popup = function(object){return ""}
  this.mapLayer = null
  if(this.cookieData){
    this.selectors = this.cookieData.selectors
   if(this.cookieData.visible){this.toggleLayer}

  }
}


/**
 * creates filters based template, targed to elementID .
 * @constructor
 * @param {string} elementID     - Name of the DataLayer.
 * @param {object} tempate  - what fields should be desplayed where, eg [{name:"name", default:"thing", class:"myclass",type:"select-multiple"}]
 */
DataLayer.prototype.createSelectors = function(elementID, template) {
  var filterDoc  = document.getElementById(elementID)
  if(this.filterDoc === null){
    throw "Error: could not find DOM object with ID: " + elementID + "-filters"
  }
  var filterList = document.createElement("ul")
  filterDoc.appendChild(filterList)

  // create  wigits based on input type
  for(temp of template){
    if(this.cookieData&&this.cookieData.selectors&&this.cookieData.selectors[temp.name]){
      var cookie = this.cookieData.selectors[temp.name]
    }
    //date object
    if(temp.type === "datepicker"){
      var filterObject = document.createElement("input")

      filterObject.setAttribute = ("type","text")
      if(cookie && cookie.value){
        if (!(cookie.value == "")){
          filterObject.value = new Date(cookie.value).toDateString()
        }
      } else if(temp.default) {
        filterObject.value = temp.default
      }
    //selector object
  } else if(temp.type ==="select-multiple"){
      var values = this.data.map((feat)=>feat.properties[temp.name])
      values = values.filter(function(value,index,self){return self.indexOf(value)===index})
      var filterObject = document.createElement("select")
      filterObject.multiple = true
      for(v of values){
        let newOption = document.createElement("option")
        newOption.value = v
        newOption.innerText = v
        if(cookie&&cookie.value){
          if(cookie.value.includes(v)){
            newOption.selected = true
         }
        } else if(temp.default){

         if (temp.default==="all" || temp.default.includes(v)){
           newOption.selected = true
         }
        }
        filterObject.appendChild(newOption)
      }
    }
    //create new list item and add widget
    if(temp.class){
      filterObject.className = temp.class
    }

    filterObject.id = this.name + temp.name + "Filter"
    if(!this.selectors[temp.name]){
      this.selectors[temp.name]={"type": temp.type}
    }
    filterObject.addEventListener("change",this.applyFilter.bind(this))
    var listItem = document.createElement("li")
    var inputDiv = document.createElement("div")
    inputDiv.className = "input-field"
    filterList.appendChild(listItem)
    listItem.appendChild(inputDiv)
    inputDiv.appendChild(filterObject)
    if(temp.displayName){
      var label = document.createElement("label")
      label.innerText = temp.displayName
      label.htmlFor = filterObject.id
      inputDiv.appendChild(label)
    }
  }
}


DataLayer.prototype.setPopup = function(template){
  this.popup =  function makePopup(object){
    var result = ''
    var link = ''
    var title = ''
    if(template.title)
       title = `<h4>${object.feature.properties[template.title]}</h4>`
    if(template.link)
       link = `<a href="${template.link + object.feature._id}">more info</a>`
    if(template.fields){
      var keys = template.fields
    } else {
      var keys = object.feature.properties
    }

    for(var field in keys){
      if(keys.hasOwnProperty(field)){
        var key = keys[field]
        value = makeDOM(object.feature.properties[key])
        result = result + `<tr><td>${field}</td><td>${value}</td></tr>`
      }
    }
    return `<div class="map-popup">${title}<table>${result}</table>${link}</div>`
  }

}


DataLayer.prototype.toggleLayer = function(){
  if(this.visible){
    this.mapLayer.removeFrom(this.map)
  } else {
    this.mapLayer = L.geoJSON(this.data,{filter:this.getFilter()}).bindPopup(this.popup)

    this.mapLayer.addTo(this.map)

  }
  this.visible = !this.visible
  this.setCookie()
}

DataLayer.prototype.applyFilter = function(){
  this.updateSelectorValues()
  if(this.visible){
    this.toggleLayer()
    this.toggleLayer()
  }
}


// TODO: This should allow some dynamic instead of forcing someone to write a function ideally.
//newfilter must take 2 params, one is the object, second is object of key value pairs: id of selectors and corrosponding values

DataLayer.prototype.setFilter = function(newFilter){
  this.filter = newFilter
  this.applyFilter()
}


DataLayer.prototype.updateSelectorValues = function(){
  for(var selector in this.selectors){
    if(!this.selectors.hasOwnProperty(selector)){continue;}
    var elem = document.getElementById(this.name + selector+"Filter")
    if(this.selectors[selector].type === "datepicker"){
      if(elem.value){
        this.selectors[selector].value =new Date(elem.value)
      } else {
        this.selectors[selector].value = null
      }
    } else if(this.selectors[selector].type === "select-multiple"){
      this.selectors[selector].value = []
      for(option of elem.options){
        if(option.selected){
          this.selectors[selector].value.push(option.value)
        }
      }
    }
  }
  this.setCookie()
}

DataLayer.prototype.getFilter = function(){
  var that = this
 var newfunc =  function(obj){

    return that.filter(obj,that.selectors)
  }
  return newfunc
}


DataLayer.prototype.setCookie = function() {
  var newc = {selectors:this.selectors,visible:this.visible}
  Cookies.set(this.name,newc)
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
