import json
import tempfile
from urllib2 import urlopen

import os.path
import os.path

tsv_url = "https://raw.githubusercontent.com/edamontology/edamontology/master/releases/%s.tsv"
tsv_file = tempfile.gettempdir() + "/%s.tsv"


def build_trees_from_tsv(tsv_file_path, encompass_deprecated_terms=False):
    tsv_file = open(tsv_file_path, 'r')
    first = True
    terms = {}
    roots = {}
    uri_col = -1
    label_col = -1
    definition_col = -1
    obsolete_col = -1
    parents_col = -1
    column_count = -1
    prev_line = ""
    row_id = 0

    term = {
        'uri': "http://www.w3.org/2002/07/owl#Thing",
        'name': "owl#Thing",
        'children': [],
    }
    terms[term['uri']] = term
    roots[term['uri']] = term

    for line in tsv_file:
        row_id += 1
        line = prev_line + line
        term_tsv = line.split('\t')
        if first:
            column_count = len(term_tsv)
            # find in which column are the information we want
            for idx, name in enumerate(term_tsv):
                if name == "Class ID":
                    uri_col = idx
                elif name == "Preferred Label":
                    label_col = idx
                elif name == "Definitions":
                    definition_col = idx
                elif name == "Obsolete":
                    obsolete_col = idx
                elif name == "Parents":
                    parents_col = idx
            first = False
        elif len(term_tsv) < column_count:
            prev_line = line + '\n'
        elif len(term_tsv) > column_count:
            print "Row %i have too much column (uri:%s)" % (row_id, term_tsv[uri_col])
            prev_line = ""
        else:
            if encompass_deprecated_terms \
                    or term_tsv[obsolete_col] == "FALSE":
                # get the term, or create it
                term = terms.get(term_tsv[uri_col], None)
                if term is None:
                    term = {
                        'uri': term_tsv[uri_col],
                        'name': term_tsv[label_col],
                        'definition': term_tsv[definition_col],
                        'children': [],
                    }
                    terms[term['uri']] = term
                else:
                    term['definition'] = term_tsv[definition_col]
                    term['name'] = term_tsv[label_col]

                # get its parent or create it
                for parent_uri in term_tsv[parents_col].split('|'):
                    parent = terms.get(parent_uri, None)
                    if parent is None:
                        parent = {
                            'uri': parent_uri,
                            'children': [],
                        }
                        terms[parent_uri] = parent
                        roots[parent_uri] = parent

                    # append it as a child
                    parent['children'].append(term)

                # as it has a parent, remove it from the roots
                roots.pop(term['uri'], None)
            elif term_tsv[obsolete_col] == "TRUE":
                pass
            else:
                print "uri:%s has an invalid deprecated status: %s" % (term_tsv[uri_col], term_tsv[obsolete_col])
            prev_line = ""
            # print row_id, len(terms)

    for t in terms.values():
        if len(t['children']) == 0:
            del t['children']

    return roots, terms


def convert_tsv_for_edam_browser(tsv_file_name='EDAM', target_file="/tmp/edam_browser_tree.json"):
    if not os.path.isfile(tsv_file % tsv_file_name):
        data = urlopen(tsv_url % tsv_file_name).read()
        f = open(tsv_file % tsv_file_name, 'w')
        f.write(data)
        f.close()

    roots, terms = build_trees_from_tsv(
        tsv_file_path=tsv_file % tsv_file_name,
        encompass_deprecated_terms=False,
    )
    json_file = open(target_file, 'w')
    json_file.write(json.dumps(roots['http://www.w3.org/2002/07/owl#Thing']))
    for child in roots['http://www.w3.org/2002/07/owl#Thing']['children']:
        if "#" not in child['uri']:
            term_id = child['uri'][child['uri'].rindex('/') + 1:]
            child_target_file = target_file[:-4] + term_id + ".json"
            json_file = open(child_target_file, 'w')
            json_file.write(json.dumps(child))


