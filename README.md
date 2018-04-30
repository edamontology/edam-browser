# Edam stand alone browser using d3.js

[![Build Status](https://travis-ci.org/IFB-ElixirFr/edam-browser.svg?branch=master)](https://travis-ci.org/IFB-ElixirFr/edam-browser)

The EDAM Browser is a client-side web-based visualization javascript widget. Its goals are to help describing bio-related resources and service with EDAM, and to facilitate and foster community contributions to EDAM.

![screenshot](./screenshot.png)

## Use it ...

### ... online

Go to https://ifb-elixirfr.github.io/edam-browser/

### ... locally

Download/clone the repository

Run `python start_edam_stand_alone_browser.py`

It starts a web server allowing you to browse edam on [localhost:20080](http://0.0.0.0:20080).

### ... with a custom ontology

EDAM Browser can render ontology described in json following the [schema](ontology.schema.json), see [here](https://github.com/IFB-ElixirFr/edam-browser/blob/master/paper.md#criteria-6) for more information on how to load a custom ontology.

## Third party integration

A demo showing you how to add the tree visualization and how you can interact with the it programmatically is available at https://ifb-elixirfr.github.io/edam-browser/demo.html
