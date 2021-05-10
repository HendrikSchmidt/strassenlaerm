#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from mapbox import Datasets
from dotenv import load_dotenv
load_dotenv()

datasets = Datasets(access_token=os.getenv("dataset_token"))
streets_dataset = os.getenv("strassen_dataset")
squares_dataset = os.getenv("plaetze_dataset")
existing_streets = datasets.list_features(streets_dataset).json()['features']
existing_squares = datasets.list_features(squares_dataset).json()['features']
existing_objects = existing_streets + existing_squares
# print(existing_objects)


def generate_geometry(street_square, parts, msg):
    def reverse_part(part_to_reverse):
        part_to_reverse['properties']['endet_bei_'], part_to_reverse['properties']['beginnt_be'] = \
            part_to_reverse['properties']['beginnt_be'], part_to_reverse['properties']['endet_bei_']
        part_to_reverse['geometry']['coordinates'][0].reverse()

    if street_square['properties']['type'] == 'street':
        # print(street_square['properties']['name'])
        parts_multi = []
        # go through all parts belonging to an object to simplify geometry
        # for p in parts:
        #     print(p['properties']['beginnt_be'] + '  ->  ' + p['properties']['endet_bei_'] + ': ' + str(p['geometry']['coordinates']))
        while parts:
            initial = parts.pop(0)
            parts_sorted = [initial]
            parts_unconnected = []
            # because objects can be built like trees or forks,
            # start with an initial object and build the longest possible line
            # by checking if the lines can be concatenated
            while part := parts.pop(0) if parts else False:
                if part['properties']['beginnt_be'] == parts_sorted[-1]['properties']['endet_bei_']:
                    parts_sorted += [part]
                elif part['properties']['endet_bei_'] == parts_sorted[0]['properties']['beginnt_be']:
                    parts_sorted = [part] + parts_sorted
                elif part['properties']['endet_bei_'] == parts_sorted[-1]['properties']['endet_bei_']:
                    reverse_part(part)
                    parts_sorted += [part]
                elif part['properties']['beginnt_be'] == parts_sorted[0]['properties']['beginnt_be']:
                    reverse_part(part)
                    parts_sorted = [part] + parts_sorted
                else:
                    # if a part doesnt fit onto the beginning or end immediately, it could still fit later
                    parts_unconnected += [part]
                    # skip re-adding of unconnected parts because no change was achieved
                    continue
                # so we throw all the parts back into the mix after every change
                parts += parts_unconnected
                parts_unconnected = []

            for i in range(len(parts_sorted) - 1):
                if not parts_sorted[i]['properties']['endet_bei_'] == parts_sorted[i+1]['properties']['beginnt_be']:
                    msg += '----------NOT SORTED CORRECTLY----------\n'
            # if no more lines can be connected, build a new line from the remaining parts
            # until all parts belong to a line
            parts_multi += [parts_sorted]
            parts = parts_unconnected

        # now get the actual coordinates from the parts to build the multilinestring
        coordinates = []
        for p, parts_sorted in enumerate(parts_multi):
            for i, part in enumerate(parts_sorted):
                if i == 0:
                    coordinates += part['geometry']['coordinates']
                else:
                    # because the next part starts where the last one ended, we throw away the starting point
                    coordinates[p] += part['geometry']['coordinates'][0][1:]
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
else:
    with open('../../data/manual.json', 'r') as f:
        objects = json.loads(f.read())


try:
    with open('../../data/Strassenabschnitte.geojson') as f:
        berlin_data = json.loads(f.read())['features']

    for obj in objects:
        msg += obj['name'] + " (" + obj['quarter'] + ")\n"
        matches = [street for street in berlin_data if street['properties']['strassenna'] == obj['name'] and street['properties']['stadtteil'] == obj['quarter']]
        if not matches:
            msg += 'Street not found.\n\n'
            continue
        first_match = matches[0]
        match_in_existing = next((street for street in existing_objects if street['id'] == str(obj['id'])), None)
        if match_in_existing:
            msg += 'Found existing.\n\n'
            continue
        new_obj = {
            'type': 'Feature',
            'id': str(obj['id']),
            'properties': {
                'wp_id': int(obj['id']),
                'name': obj['name'],
                'type': 'square' if first_match['properties']['strassen_2'] == 'PLAT' else 'street',
                'quarter': obj['quarter'],
                'street_no': first_match['properties']['strassensc'],
            },
        }
        new_obj['geometry'] = generate_geometry(new_obj, matches, msg)
        if new_obj['properties']['type'] == 'street':
            update = datasets.update_feature(streets_dataset, new_obj['id'], new_obj).json()
        else:
            update = datasets.update_feature(squares_dataset, new_obj['id'], new_obj).json()

        msg += str(update) + '\n' if 'message' in update else 'Uploaded successfully.\n\n'
except Exception as e:
    msg += '\n' + str(e) + '\n'

sys.stdout.write(msg)
