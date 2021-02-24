import os
import json
import requests
from mapbox import Datasets
from dotenv import load_dotenv
load_dotenv()

url = 'https://api.mapbox.com/tilesets/v1/'
datasets = Datasets(access_token=os.getenv("dataset_token"))
dataset_to_tileset = [
    (os.getenv("squares_dataset"), 'plaetze'),
    (os.getenv("streets_dataset"), 'strassen')
]

for dataset_id in dataset_to_tileset:
    collection = datasets.list_features(dataset_id[0]).json()
    features = collection['features']
    ld_features = ''
    for feature in features:
        ld_features += json.dumps(feature) + '\n'

    files = {'file': (dataset_id[1] + '.geojson', ld_features)}

    r = requests.put(
        url + 'sources/strassenlaerm/' + dataset_id[1] + '?access_token=' + os.getenv("tileset_token"),
        files=files
    )
    print(r.text)

    r = requests.post(url + 'strassenlaerm.' + dataset_id[1] + '/publish?access_token=' + os.getenv("tileset_token"))
    print(r.text)
