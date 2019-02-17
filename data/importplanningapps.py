from devappscraper import *
import datetime
import pymongo
url = "https://app01.ottawa.ca/postingplans/searchResults.jsf?lang=en&newReq=yes&action=as&descriptionSearch=true&allWordsSearchValue=&exactPhraseSearchValue=&oneOfWordsSearchValue=&streetNo=&streetName=&wardSearch=true&ward=__305T5G&applicationType=&applicationNo="
delay = 1
x = get_applist(url, delay)['features']

client = pymongo.MongoClient("mongodb://localhost:27017")

db = client['futureottawa']

scraped= db['planningapps_historical']
apps = db['planningapps']
now = datetime.datetime.utcnow()

for app in x:
    scraped.update_one(app,{'$setOnInsert':{'retrieved':now}},upsert=True)

# update these unique values
set_fields = ['ward_num','Date Received','ward_name','councillor','Application','Application #', 'Address', 'Description', 'Name', 'Phone','appid']

# update these sets
for app in x:
    set = {'geometry.coordinates':app['geometry']['coordinates'],'geometry.type':app['geometry']['type'],'type':app['type']}
    for field in set_fields:
        set['properties.'+field] = app['properties'][field]
    # maintain latest status
    set['properties.latest_status'] =  app['properties']['status']['type']
    apps.update_one({"properties.Application #":app['properties']['Application #']},{
    '$set': set,
    '$addToSet':{'properties.status':app['properties']['status'], 'properties.Supporting Documents':{'$each': app['properties']['Supporting Documents']}}

    },upsert=True)
