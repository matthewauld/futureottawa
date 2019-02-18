from devappscraper import *
import datetime
import pymongo

def process_search(url, delay):
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


def main():
    wards = ['__305T5V', '__305T5Y', '__305T51', '__305T53', '__305T54', '__305T56', '__305T57', '__305T59', '__305T5A', '__305T5B', '__305T5D', '__305T5F', '__305T5G', '__305T6I', '__305T6J', '__305T6L', '__305T6N', '__305T6O', '__305T6Q', '__305TGP', '__305T6S', '__6N75G3', '__6N75G7']
    types = ['___1TZWX','_____1C2', '__3Z8407','__1OVDH7','______5H','____5CCV', '____AU3U']
    url = "https://app01.ottawa.ca/postingplans/searchResults.jsf?lang=en&newReq=yes&action=as&descriptionSearch=true&allWordsSearchValue=&exactPhraseSearchValue=&oneOfWordsSearchValue=&streetNo=&streetName=&wardSearch=true&ward={0}&applicationTypeSearch=true&applicationType={1}&applicationNo="
    for x in wards:
        for y in types:
            process_search(url.format(x,y),0.5)



if __name__ == '__main__':
    main()
