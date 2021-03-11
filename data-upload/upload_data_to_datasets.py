#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from mapbox import Datasets
from dotenv import load_dotenv
load_dotenv()

datasets = Datasets(access_token=os.getenv("dataset_token"))

objects = [
    # Faschistisch
    {'id': 340, 'name': 'Gotenburger Straße', 'quarter': 'Gesundbrunnen'},
    {'id': 340, 'name': 'Kruppstraße', 'quarter': 'Moabit'},
    {'id': 340, 'name': 'Manfred-von-Richthofen-Straße', 'quarter': 'Tempelhof'},
    {'id': 340, 'name': 'Robert-Rössle-Straße', 'quarter': 'Buch'},
    {'id': 340, 'name': 'Eschwegering', 'quarter': 'Tempelhof'},
    # Kolonialistisch
    {'id': 340, 'name': 'Wissmannstraße', 'quarter': 'Grunewald'},
    {'id': 340, 'name': 'Wissmannstraße', 'quarter': 'Neukölln'},
    {'id': 340, 'name': 'Lüderitzstraße', 'quarter': 'Wedding'},
    {'id': 340, 'name': 'Nachtigalplatz', 'quarter': 'Wedding'},
    {'id': 340, 'name': 'Mohrenstraße', 'quarter': 'Mitte'},
    {'id': 340, 'name': 'Onkel-Tom-Straße', 'quarter': 'Zehlendorf'},
    {'id': 340, 'name': 'Nettelbeckplatz', 'quarter': 'Wedding'},
    {'id': 340, 'name': 'Bismarckstraße', 'quarter': 'Charlottenburg'},
    {'id': 340, 'name': 'Bismarckstraße', 'quarter': 'Spandau'},
    {'id': 340, 'name': 'Bismarckstraße', 'quarter': 'Steglitz'},
    {'id': 340, 'name': 'Bismarckstraße', 'quarter': 'Zehlendorf'},
    {'id': 340, 'name': 'Bismarckstraße', 'quarter': 'Wannsee'},
]

existing_streets = datasets.list_features(os.getenv("streets_dataset")).json()['features']
existing_squares = datasets.list_features(os.getenv("squares_dataset")).json()['features']
existing_objects = existing_streets + existing_squares
print(existing_objects)


def generate_geometry(street_square, parts):
    if street_square['properties']['type'] == 'street':
        coordinates = [line
                       for part in parts
                       for line in part['geometry']['coordinates']]
        return {'type': 'MultiLineString', 'coordinates': coordinates}
    else:
        # squares need to be polygons
        if len(parts) == 1:
            # matches_by_no contains only 1 match
            # append first coordinate to close polygon
            coordinates = first_match['geometry']['coordinates']
            coordinates[0] += [coordinates[0][0]]
        else:
            # multiple matches found, we need to piece together the different multilinestrings
            initial = parts.pop(0)
            parts_sorted = [initial]
            while part := parts.pop(0) if parts else False:
                if part['properties']['beginnt_be'] == parts_sorted[-1]['properties']['endet_bei_']:
                    parts_sorted += [part]
                elif part['properties']['endet_bei_'] == parts_sorted[0]['properties']['beginnt_be']:
                    parts_sorted = [part] + parts_sorted
                else:
                    parts += [part]

            for i, part in enumerate(parts_sorted):
                if i == 0:
                    coordinates = part['geometry']['coordinates']
                else:
                    coordinates[0] += part['geometry']['coordinates'][0][1:]

        return {'type': 'Polygon', 'coordinates': coordinates}


msg = ""

if len(sys.argv) > 1:
    objects = json.loads(sys.argv[1])
    try:
        with open('../../data/Strassenabschnitte.geojson') as f:
            berlin_data = json.loads(f.read())['features']
            for obj in objects:
                msg += obj['name'] + " (" + obj['quarter'] + ")\n"
                matches = [street for street in berlin_data if street['properties']['strassenna'] == obj['name'] and street['properties']['stadtteil'] == obj['quarter']]
                first_match = matches[0]
                new_obj = {
                    'type': 'Feature',
                    'id': str(obj['id']),
                    'properties': {
                        'name': obj['name'],
                        'type': 'square' if first_match['properties']['strassen_2'] == 'PLAT' else 'street',
                        'quarter': obj['quarter'],
                        'street_no': first_match['properties']['strassensc'],
                    },
                }
                match_in_existing = next((street for street in existing_objects if street['id'] == new_obj['id']), None)
                if match_in_existing:
                    msg += 'Found existing.\n'
                else:
                    new_obj['geometry'] = generate_geometry(new_obj, matches)
                    if new_obj['properties']['type'] == 'street':
                        update = datasets.update_feature(os.getenv("streets_dataset"), new_obj['id'], new_obj).json()
                    else:
                        update = datasets.update_feature(os.getenv("squares_dataset"), new_obj['id'], new_obj).json()

                    msg += str(update) + '\n' if 'message' in update else 'Uploaded successfully.\n'
    except Exception as e:
        msg += '\n'
        msg += str(e)
        msg += '\n'
else:
    msg += 'Argument missing.'

sys.stdout.write(msg)
