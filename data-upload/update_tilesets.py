import sys
import os
import json
import requests
from mapbox import Datasets
from dotenv import load_dotenv
load_dotenv()

if len(sys.argv) != 3:
    print('Please supply a mode <create|publish> and tile set <plaetze|strassen|viertel|denkmaeler|gebaeude>.')
    sys.exit(1)

mode = sys.argv[1]
tileset = sys.argv[2]
url = 'https://api.mapbox.com/tilesets/v1/'
access_string = '?access_token=' + os.getenv("tileset_token")


if 'source' in mode:
    dataset_id = os.getenv(tileset + '_dataset')
    datasets = Datasets(access_token=os.getenv("dataset_token"))
    collection = datasets.list_features(dataset_id).json()
    features = collection['features']
    ld_features = '\n'.join(json.dumps(feature) for feature in features)
    files = {'file': (tileset + '.geojson', ld_features)}
    sources_url = url + 'sources/strassenlaerm/' + tileset + access_string
    if mode == 'create_source':
        r = requests.post(sources_url, files=files)
    elif mode == 'replace_source':
        r = requests.put(sources_url, files=files)
    else:
        print('Please use a valid mode.')
        sys.exit(1)
elif mode == 'create_tileset':
    with open('recipe-' + tileset + '.json', 'r') as recipe_file:
        r = requests.post(url + 'strassenlaerm.' + tileset + access_string, json=json.loads(recipe_file.read()))
elif mode == 'publish_tileset':
    r = requests.post(url + 'strassenlaerm.' + tileset + '/publish' + access_string)
else:
    print('Please use a valid mode.')
    sys.exit(1)

print(r.text)
