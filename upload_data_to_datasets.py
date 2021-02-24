import os
import json
from mapbox import Datasets
from dotenv import load_dotenv
load_dotenv()

datasets = Datasets(access_token=os.getenv("dataset_token"))

street_names = [
    # Faschistisch
    'Gotenburger Straße',
    'Kruppstraße',
    # 'STC Carl Diem-Oberschule Guido Bockelmann Hohenzollerndamm 97',
    # 'Friedrich-Ludwig-Jahn-Sportpark',
    'Manfred-von-Richthofen-Straße',
    'Robert-Rössle-Straße',
    # 'Robert-Rössle-Denkmal',
    # 'Robert-Rössle-Klinik',
    'Walter-Linse-Straße',
    'Spanische Allee',
    'Eschwegering',
    'Darsteiner Weg',
    'Treitschkestraße',
    'Johannes-Itten-Straße',
    'Hindenburgdamm',
    'Pacelliallee',
    # 'Henry-Ford-Bau',
    # 'Ferdinand Sauerbruch (Weg Charite)',
    # 'Karl Bonhoeffer (Weg und Klinik)',
    'Stauffenbergstraße',
    # Kolonialistisch
    'Wissmannstraße',
    'Wissmannstraße',
    'Woermannkehre',
    'Petersallee',
    'Lüderitzstraße',
    'Nachtigalplatz',
    'Mohrenstraße',
    'Lansstraße',
    'Iltisstraße',
    'Takustraße',
    'Maerckerweg',
    'Onkel-Tom-Straße',
    'Nettelbeckplatz',
    'Bismarckstraße',
    'Dönhoffstraße',
]

squares = []
streets = []

with open('../data/Strassenabschnitte.geojson') as f:
    berlin_data = json.loads(f.read())['features']
    for name in street_names:
        print('\n\n')
        print(name)
        matches = [street for street in berlin_data if street['properties']['strassenna'] == name]
        street_numbers = set([match['properties']['strassensc'] for match in matches])
        for street_no in street_numbers:

            matches_by_no = [street for street in berlin_data if street['properties']['strassensc'] == street_no]
            print(street_no)
            print(str(len(matches_by_no)) + ' matches')

            first_match = matches_by_no[0]
            street = {
                'type': 'Feature',
                'id': street_no,
                'properties': {'name': name},
                'stadtteil': first_match['properties']['stadtteil']
            }

            if first_match['properties']['strassen_2'] == 'PLAT':
                # squares need to be polygons
                if len(matches_by_no) == 1:
                    # matches_by_no contains only 1 match
                    # append first coordinate to close polygon
                    coordinates = first_match['geometry']['coordinates']
                    coordinates[0] += [coordinates[0][0]]
                else:
                    # multiple matches found, we need to piece together the different multilinestrings
                    initial = matches_by_no.pop(0)
                    matches_sorted = []
                    matches_sorted += [initial]
                    while match := matches_by_no.pop(0) if matches_by_no else False:
                        if match['properties']['beginnt_be'] == matches_sorted[-1]['properties']['endet_bei_']:
                            matches_sorted += [match]
                        elif match['properties']['endet_bei_'] == matches_sorted[0]['properties']['beginnt_be']:
                            matches_sorted = [match] + matches_sorted
                        else:
                            matches_by_no += [match]

                    for i, match in enumerate(matches_sorted):
                        if i == 0:
                            coordinates = match['geometry']['coordinates']
                        else:
                            coordinates[0] += match['geometry']['coordinates'][0][1:]

                street['geometry'] = {
                    'type': 'Polygon',
                    'coordinates': coordinates
                }
                squares += [street]
                update = datasets.update_feature(os.getenv("squares_dataset"), street['id'], street).json()
            else:
                coordinates = []
                for match in matches_by_no:
                    coordinates += match['geometry']['coordinates']
                street['geometry'] = {
                    'type': 'MultiLineString',
                    'coordinates': coordinates
                }
                streets += [street]
                update = datasets.update_feature(os.getenv("streets_dataset"), street['id'], street).json()

            print(update)
