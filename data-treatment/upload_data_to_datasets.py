import os
import json
from mapbox import Datasets
import mysql.connector
from dotenv import load_dotenv
load_dotenv()

datasets = Datasets(access_token=os.getenv("dataset_token"))

# config = {
#     'host': os.getenv('db_host'),
#     'user': os.getenv('db_user'),
#     'password': os.getenv('db_pass'),
#     'database': os.getenv('db'),
#     'raise_on_warnings': True
# }
#
# cnx = mysql.connector.connect(**config)
# cursor = cnx.cursor()
#
# query = ("SELECT first_name FROM employees "
#          "WHERE hire_date BETWEEN %s AND %s")
#
# category = 'strassen_und_plaetze'
#
# cursor.execute(query, category)
#
# for (street) in cursor:
#     print(street)
#
# cursor.close()
# cnx.close()

shortDesc = 'Rössle war schon vor der Machtergreifung Hitlers ein Verfechter der <b>Eugenik</b>, die im Nationalsozialismus als Rechtfertigung des Mordes an Menschen mit körperlichen und geistigen Behinderungen diente.'
longDesc = '<span style="font-weight: 400;">Robert Rössle studierte in München, Kiel und Straßburg Medizin. Nach der Habilitation arbeitete er in Jena und Basel, bis er 1929 an den Lehrstuhl für Pathologie der Charité Berlin berufen wurde, welchen er bis 1948 leitete. </span> \
<span style="font-weight: 400;">Rössle war schon vor der Machtergreifung Hitlers ein Verfechter der </span><b>Eugenik</b><span style="font-weight: 400;">, die im Nationalsozialismus als Rechtfertigung des Mordes an Menschen mit körperlichen und geistigen Behinderungen diente. </span> \
<span style="font-weight: 400;">In den 1930er Jahren ließ er zu Forschungszwecken Gefangene aus dem Untersuchungsgefängnis Moabit kastrieren, die wegen sogenannter “Sittlichkeitsverbrechen”  - zum Beispiel Homosexualität - inhaftiert waren und sezierte ihre Hoden. Parallel wirkte er mit bei der, von Günther Just und Karl Heinrich Bauer ab 1935 herausgegebenen, eugenischen “Zeitschrift für menschliche Vererbungs- und Konstitutionslehre”. Da Rössles Studien sich viel mit der Vererbung innerhalb von Familien beschäftigten, profitierte er in seiner Forschung maßgeblich von Massensterben jüdischer Familien Ende der 1930er Jahre. 1936 wurde er aufgrund seiner Forschung in die Deutsche Akademie der Naturforscher Leopoldina aufgenommen.</span> \
<span style="font-weight: 400;">Rössle erhielt </span><a href="https://taz.de/Umstrittene-Strassennamen-in-Berlin/!5665893/"><span style="font-weight: 400;">nach Recherchen von Biochemikerin Ute Linz</span></a><span style="font-weight: 400;"> auch Gehirne von Julius Hallervorden. Der stellvertretende Direktor am Kaiser-Wilhelm-Institut für Hirnforschung (KWI), untersuchte rund 700 Gehirne von Kindern und Jugendlichen aus Brandenburg untersuchte, die bei der “Aktion T4” ermordet wurden.</span> \
<span style="font-weight: 400;">Am 18. August 1942 berief ihn Adolf Hitler in den wissenschaftlichen Senat des Heeressanitätswesens.</span> \
<span style="font-weight: 400;">Rössle beteiligte sich möglicherweise auch an der auf Menschenversuchen basierenden Luftwaffenforschung über “Die pathologisch-anatomischen Veränderungen bei Druckfallkrankheit und Luftstoßschäden”. Wie genau seine Beteiligng hier aussah sei aber unklar. </span> \
<span style="font-weight: 400;">1944 wurde Rössle in den Wissenschaftlichen Beirat des “Generalkommissars für das Sanitäts- und Gesundheitswesen” von Dr. Karl Brandt berufen. Die “</span><a href="https://portal.ehri-project.eu/units/de-002429-r_185"><span style="font-weight: 400;">Aktion Brandt</span></a><span style="font-weight: 400;">” umfasste den Mord an Menschen mit Behinderung aus Heil- und Pflegeanstalten, um freie Krankenhausbetten für Kriegsopfer zu schaffen.</span> \
<span style="font-weight: 400;">Da Rössle kein NSDAP-Mitglied gewesen war, lehrte er nach dem Ende des Zweiten Weltkriegs weiterhin an der Humboldt-Universität zu Berlin. Nach der Emeritierung arbeitete er bis zum Jahr 1953 am Städtischen Wenckebach-Krankenhaus in Berlin und widmete sich anschließend experimentellen Studien am Institut für Gewebeforschung.</span> \
<span style="font-weight: 400;">Rössle wurde 1949 mit dem Nationalpreis der DDR ausgezeichnet, er erhielt mehrere Ehrendoktorwürden, war Ehrenmitglied von elf wissenschaftlichen Gesellschaften und ordentliches Mitglied der </span><a href="https://www.bbaw.de/die-akademie/akademie-historische-aspekte/mitglieder-historisch/historisches-mitglied-robert-roessle-2299"><span style="font-weight: 400;">Preußischen Akademie der Wissenschaften in Berlin</span></a><span style="font-weight: 400;">. 1952 erhielt er das Verdienstkreuz der Bundesrepublik Deutschland. Robert Rössle starb 1956 in Berlin.</span> \
<span style="font-weight: 400;">Drei Jahre nach seinem Tod wurde das 1959 Akademieinstitut für Medizin und Biologie der DDR - ein ehemaliges Kaiser-Wilhelm-Institut - in Robert-Rössle-Klinik umbenannt.</span> \
<span style="font-weight: 400;">Zwischen 1947-1991 wurden am Campus Berlin-Buch eine Reihe von Gedenkbüsten aufgestellt, um an Wissenschaftler und Ärzte zu erinnern, die am Wiederaufbau nach dem Zweiten Weltkrieg beteiligt waren. 1960 wurde vor der Robert-Rössle-Klinik eine von Gerhard Thieme geschaffene Porträtbüste aufgestellt und 1974 die Straße zum Campus nach ihm benannt. Die Klinik heißt seit 2001 nicht mehr nach Robert-Rössle, da sie vom privaten Helios Konzern gekauft wurde, allerdings finden sich noch einige Beschilderungen oder Online-Einträge, die den alten Namen tragen.</span>'
current = '<span style="font-weight: 400;">Die </span><a href="https://taz.de/Umstrittene-Strassennamen-in-Berlin/!5665893/"><span style="font-weight: 400;">Biochemikerin Ute Linz</span></a><span style="font-weight: 400;"> engagiert sich für die neue historische Aufarbeitung von Robert Rössle. Sie hat in den vergangenen Jahren Material über ihn zusammengetragen, die eine umfassende historische Aufarbeitung und Umbenennung ihrer Meinung nach dringend notwendig machen. Im November 2015 wandte sie sich erstmals brieflich ans Bezirksamt Pankow, die Nachforschungen versprechen. Als daraufhin nichts passiert, wendet sie sich am 4. Februar 2017 mit einer Petition an die Bezirksverordnetenversammlung (BVV). </span> \
<span style="font-weight: 400;">Der stellvertretende Direktor des Instituts für Geschichte der Medizin und Ethik in der Medizin an der Charité Thomas Beddies äußerte sich gegenüber einer Umbenennung kritisch und plädiert für eine kritische Kontextualisierung des Namens ”im Sinne einer lebendigen Erinnerungs- und Mahnkultur” </span><a href="https://taz.de/Umstrittene-Strassennamen-in-Berlin/!5665893/"><span style="font-weight: 400;">(taz)</span></a><span style="font-weight: 400;">. Ute Linz widerspricht dieser Idee als nicht angemessen und schlug vor der Straße wieder den alten Namen “Pappelweg” zu geben.</span>'
sources = '<ul> \
<li><span style="font-weight: 400;">Bildhauerei in Berlin (Hg.): Denkmal Robert Rössle, URL: </span><a href="https://bildhauerei-in-berlin.de/bildwerk/denkmal-robert-roessle/"><span style="font-weight: 400;">https://bildhauerei-in-berlin.de/bildwerk/denkmal-robert-roessle/</span></a><span style="font-weight: 400;">, 16.02.2020.</span></li> \
<li><span style="font-weight: 400;">GND: </span><a href="http://d-nb.info/gnd/118602055"><span style="font-weight: 400;">http://d-nb.info/gnd/118602055</span></a></li> \
<li><span style="font-weight: 400;">VIAF: </span><a href="https://viaf.org/viaf/56674994/"><span style="font-weight: 400;">https://viaf.org/viaf/56674994/</span></a></li> \
<li><span style="font-weight: 400;">Taz (Hg.): Umstrittene Straßennamen in Berlin. URL: </span><a href="https://taz.de/Umstrittene-Strassennamen-in-Berlin/!5665893/"><span style="font-weight: 400;">https://taz.de/Umstrittene-Strassennamen-in-Berlin/!5665893/</span></a><span style="font-weight: 400;">, 16.02.2020.</span></li> \
</ul>'


objects = [
    # Faschistisch
    {'name': 'Gotenburger Straße', 'quarter': 'Gesundbrunnen'},
    {'name': 'Kruppstraße', 'quarter': 'Moabit'},
    {'name': 'Manfred-von-Richthofen-Straße', 'quarter': 'Tempelhof'},
    {'name': 'Robert-Rössle-Straße', 'quarter': 'Buch'},
    {'name': 'Eschwegering', 'quarter': 'Tempelhof'},
    # Kolonialistisch
    {'name': 'Wissmannstraße', 'quarter': 'Grunewald'},
    {'name': 'Wissmannstraße', 'quarter': 'Neukölln'},
    {'name': 'Lüderitzstraße', 'quarter': 'Wedding'},
    {'name': 'Nachtigalplatz', 'quarter': 'Wedding'},
    {'name': 'Mohrenstraße', 'quarter': 'Mitte'},
    {'name': 'Onkel-Tom-Straße', 'quarter': 'Zehlendorf'},
    {'name': 'Nettelbeckplatz', 'quarter': 'Wedding'},
    {'name': 'Bismarckstraße', 'quarter': 'Charlottenburg'},
    {'name': 'Bismarckstraße', 'quarter': 'Spandau'},
    {'name': 'Bismarckstraße', 'quarter': 'Steglitz'},
    {'name': 'Bismarckstraße', 'quarter': 'Zehlendorf'},
    {'name': 'Bismarckstraße', 'quarter': 'Wannsee'},
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


with open('../../data/Strassenabschnitte.geojson') as f:
    berlin_data = json.loads(f.read())['features']
    for obj in objects:
        print('\n')
        print(obj['name'], obj['quarter'])
        matches = [street for street in berlin_data if street['properties']['strassenna'] == obj['name'] and street['properties']['stadtteil'] == obj['quarter']]
        first_match = matches[0]
        new_obj = {
            'type': 'Feature',
            'id': first_match['properties']['strassensc'],
            'properties': {
                'name': obj['name'],
                'type': 'square' if first_match['properties']['strassen_2'] == 'PLAT' else 'street',
                'quarter': obj['quarter'],
                'shortDesc': shortDesc,
                'longDesc': longDesc,
                'current': current,
                'sources': sources
            },
        }
        match_in_existing = next((street for street in existing_objects if street['id'] == new_obj['id']), None)
        if match_in_existing:
            print('Found Existing')
            print(match_in_existing['geometry'])
            new_obj['geometry'] = match_in_existing['geometry']
        else:
            new_obj['geometry'] = generate_geometry(new_obj, matches)

        if new_obj['properties']['type'] == 'street':
            update = datasets.update_feature(os.getenv("streets_dataset"), new_obj['id'], new_obj).json()
        else:
            update = datasets.update_feature(os.getenv("squares_dataset"), new_obj['id'], new_obj).json()

        if 'message' in update:
            print(update)
