---
title: 'A reusable tree-based web-visualization to browse EDAM ontology, and contribute to it.'
tags:
- javascript
- bioinformatics
- d3js
- d3.js
- ontology
- visualization
- edamontology
- ontology
authors:
- name: Bryan Brancotte
  orcid: 0000-0001-8669-5525
  affiliation: "1" # (Multiple affiliations must be quoted)
- name: Christophe Blanchet
  affiliation: 2
- name: Hervé Ménager
  orcid: 0000-0002-7552-1009
  affiliation: 1
affiliations:
- name: Centre d'Informatique pour la Biologie, C3BI, Institut Pasteur, Paris, France
  index: 1
- name: French Institute of Bioinformatics, CNRS IFB-Core, Gif-sur-Yvette, France
  index: 2
date: 01 February 2018
bibliography: paper_resources/paper.bib
---

# Summary

## Abstract

Labelling, indexing and describing a Bioinformatics resource, whether it is a software, a database, or a service is of a great help when it comes to promoting it to various user communities. As an example, the ELIXIR bio.tools [@ison2015tools] registry contains more than ten thousands software and service entries. In this context, the use of controlled vocabularies to describe the resources is of a paramount importance. In bio.tools, this need is addressed by the EDAM Ontology [@ison2013edam], which proposes a controlled vocabulary hierarchically organized around four axes which describe types of data, formats, operations and topics.

We here present the EDAM Browser, a client-side web-based visualization javascript widget that provides an interface to navigate EDAM. This browser is tailored to the needs of EDAM users that might not be ontology experts. It can, among other things, be used to help describing resources, and to facilitate and foster community contributions to EDAM. Throughout the rest of this paper, (i) we review related work and features that need to be addressed; (ii) we describe how these features are addressed by the EDAM Browser; finally (iii) we discuss its reusability.

## Main functionalities

We collected from EDAM users and authors features that a browser should have to fit their needs. We evaluated different platforms, and found that none of them propose all the features asked by users. Hereafter are the evaluated platforms: 
* AberOWL[@hoehndorf2015aber]
* BioPortal[@whetzel2011bioportal]
* OLS - Ontology Lookup Service[@jupp2015new]
* Ontobee[@xiang2011ontobee]
* WebProt&eacute;g&eacute;[@tudorache2013webprotege].

Hereafter we list features and detail how we address them. 

##### EDAM is present and publicly available

The EDAM Browser is publicly available and does not require authentication. 

##### Display of multiple parents

The EDAM ontology, while being represented as a tree, is a directed acyclic graph, meaning that a term can have more than one parent. Displaying this information in a clear way in the navigation interface is fundamental to users, who can then more easily understand the meaning of the represented concept, or locate neighboring ones. 

Multiple parents are handled (see [for instance the link to the Phylogeny topic](https://ifb-elixirfr.github.io/edam-browser/#topic_0084)). In order to improve readability when a term is selected (1) all the term's positions are shown; and (2) all paths from the root node are highlighted (cf Fig. 1).

![The term Phylogeny has two parents](paper_resources/topics_tree_phylogeny.png)

##### Can be integrated in external websites

The ability to integrate the EDAM Browser, and its tree representation is major feature, in order to help third party websites promoting their resources when labeled with EDAM. Both the autocomplete input field and the tree visualization are re-usable. To highlight this statement we propose a dynamic [demo](https://ifb-elixirfr.github.io/edam-browser/demo.html) showing how the tree can be integrated, how the user can  interact with the tree, and how to programmaticaly interact with the tree in JavaScript. 

##### Facilitate community contributions

Letting users contribute to the ontology improves acceptance by the community as a user propose changes to the ontology to fit his/her needs. The EDAM Browser gives access to a form letting the user propose the changes and then format his/her changes in a github issue ready to be submitted by the user (cf Fig. 2). 

![The edition form and the issue created](paper_resources/edition_form_to_github_issue.png)

##### Use edited version of EDAM

Using the EDAM Browser to explore a local or in-development version is possible. The ontology file should follow the schema accessible [here](https://ifb-elixirfr.github.io/edam-browser/ontology.schema.json) which is expressed in [json schema](http://json-schema.org/). An example file is [there](https://ifb-elixirfr.github.io/edam-browser/media/regular.example.json). The [edam2json utility](https://github.com/edamontology/edam2json) can be used to generate the ontology in this format from any EDAM owl file.  

An ontology is loaded into the EDAM Browser by clicking on the button labelled _Custom_ at the top of its interface, and specifying either a public URL to the file or a local path to load it from (cf Fig. 3). 

![Providing a custom ontology](paper_resources/custom_ontology.png)


Note that the providing a custom ontology will change the URL fragment such that this configuration can be bookmarked and reopen later : [resulting link](https://ifb-elixirfr.github.io/edam-browser/?url=https%3A%2F%2Fraw.githubusercontent.com%2FIFB-ElixirFr%2Fedam-browser%2Fmaster%2Fmedia%2Fregular.example.json&identifier_accessor=d.id&text_accessor=d.text#p9&custom_url).

##### Local installation

The EDAM Browser can easily be downloaded and run on a personal computer. The user either open index.html and then chose to load an ontology, or starts a local web server using `python start_edam_stand_alone_browser.py` and the ontology will automatically be loaded (recommended scenario).

##### Links to annotated resources

The EDAM Browser proposes links and statistics from several bioinformatics projects which use the EDAM ontology:
- [bio.tools](https://bio.tools) which labels software and services
- [BioSphere](https://biosphere.france-bioinformatique.fr/)[@brancotte2017biosphere] which  labels appliances,
- [Bioweb](https://bioweb.pasteur.fr) which labels software and databanks available at the Pasteur Institut 
- [TeSS](https://tess.elixir-europe.org/) which labels training materials

## Conclusion

The EDAM Browser allows users to browse it with an interface tailored to its structure and properties. Its interface is not designed to be a generic ontology navigation and edition platform, but rather to provide features requested by most users and contributors:
- navigation between different axes of the ontology, based on the EDAM properties that define their relationships (e.g. this *format* represents this type of *data*, this *data* is an output of this *operation* or is specific of this *topic*)
- representation of the usage of the different concepts in annotated resource collections (e.g. bio.tools, BioSphere, BioWeb, TeSS)
- architecture facilitating its local deployment and its reuse in other websites
- ability to work with edited version of the ontology with or without local installation
- encouraging community contribution to the ontology

# References
