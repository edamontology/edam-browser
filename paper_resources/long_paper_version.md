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

## Related work

We collected from EDAM users and authors features that a browser should have to fit their needs. Hereafter we describe collected criteria and their presence or absence in the following platforms: (i) BioPortal[@whetzel2011bioportal], (ii) OLS - Ontology Lookup Service[@jupp2015new], (iii)  WebProt&eacute;g&eacute;[@tudorache2013webprotege] and (iv) AberOWL[@hoehndorf2015aber].

| id  | Feature                                | AberOWL                    | BioPortal          | OLS                        | WebProtégé                 |
|:---:|----------------------------------------|:--------------------------:|:------------------:|:--------------------------:|:--------------------------:|
| 1   | EDAM is present                        | yes                        | yes                | yes                        | yes                        |
| 2   | Publicly available                     | yes                        | yes                | yes                        | registration               |
| 3   | Display of multiple parents            | no                         | no                 | yes                        | no                         |
| 4   | Can be integrated in external websites | no                         | yes                | yes                        | no                         |
| 5   | Facilitate community contribution      | no                         | limited            | no                         | yes                        |
| 6   | Use edited version of EDAM             | no                         | no                 | no                         | yes                        |
| 7   | Local installation                     | yes      (w/ admin rights) | yes      (as a VM) | yes      (w/ admin rights) | yes      (w/ admin rights) |
| 8   | Links to annotated resources           | no                         | no                 | no                         | no                         |


##### Criteria 1 and 2 - "EDAM is present and publicly available"

The first two criteria designate wether these interfaces allow to navigate EDAM, and to do so in a anonymous manner. The access to the web interface should be as simple and fast as possible, especially for users who do not need ellaborate functionalities. On the one hand the AberOWL, BioPortal and OLS platforms integrate EDAM and let unauthenticated users browse it. On the other hand, WebProt&eacute;g&eacute; is meant for ontology edition. It asks users to register before uploading its ontology, or browsing the [latest stable version](https://webprotege.stanford.edu/#projects/98640503-a37d-4404-84da-caf30fadd685/edit/Classes) of EDAM.

##### Criteria 3 - "Display of multiple parents"

The EDAM ontology, while being represented as a tree, is a directed acyclic graph, meaning that a term can have more than one parent. Displaying this information in a clear way in the navigation interface is fundamental to users, who can then more easily understand the meaning of the represented concept, or locate neighboring ones. For instance, when searching for the Topic "Phylogeny", [OLS](https://www.ebi.ac.uk/ols/ontologies/edam/terms?iri=http%3A%2F%2Fedamontology.org%2Ftopic_0084) indicates that the term has multiple parents both in the tree representation and the details. Other platforms, i.e. [AberOWL](http://aber-owl.net/ontology/EDAM/#/Browse/<http%3A%2F%2Fedamontology.org%2Ftopic_0084>), [BioPortal](http://bioportal.bioontology.org/ontologies/EDAM/?p=classes&conceptid=http%3A%2F%2Fedamontology.org%2Ftopic_0084), and  WebProt&eacute;g&eacute;, display the term at only one position in the tree while the details tab indicates that the term is a _subClassOf_ two terms. 

##### Criteria 4 - "Can be integrated in external websites"

The integration of such visualisations in external websites in the form of reusable components can prove convenient for resources that use EDAM for the annotation of resources, given the cost for the development and maintenance of such interfaces. Bioportal allows to integrate [widgets](http://bioportal.bioontology.org/ontologies/EDAM/?p=widgets) such as autocomplete forms, graph and tree visualizations. Widgets for OLS can be found in [biojs](http://biojs.io) registry. Neither AberOWL nor WebProtégé propose widgets.  

##### Criteria 5 - "Facilitate community contributions"

One of the most difficult challenges for community projects like EDAM is to encourage and facilitate the contributions from the various domain experts that can make use of it. It should be noted that many of these experts, while extremely knowledgeable in different domains of bioinformatics, might not be familiar with the syntax and constraints associated with the edition of ontologies. Many of the existing systems only provide basic help to facilitate such contributions:
- AberOWL indicates the homepage of the ontology. 
- BioPortal provides a custom suggestion and bug report mechanism that lets users provide feedback on the contents of the ontology. However, this mechanism, being generic to all ontologies, is not deeply integrated with the development forge used by each ontology. 
- OLS provides only the possibility to contact the authors through email. 
- WebProtégé allows an ontology owner to share his ontology with a link, giving authenticated users the possibility to discuss terms through conversation threads.

##### Criteria 6 - "Use edited version of EDAM"

It can be convenient for ontology authors to publish a locally modified or development version of EDAM. Beyond the regular official releases of the EDAM ontology, the "in-development" version cannot be browsed with AberOWL, BioPortal nor OLS without a manual and public submission, or a local installation of one of these platforms. The publication of submitted releases is usually processed within a few hours.
WebProtégé, however, allows to upload any ontology, and within seconds it is possible to browse and edit it.

##### Criteria 7 - "Local installation"

All of the considered systems can be installed locally, in one way or another:
- AberOWL can locally be [installed](https://github.com/bio-ontology-research-group/aberowl-meta), software requirements includes Redis, nodejs, npm, Groovy and Apache2.
- BioPortal is available as a [virtual appliance](https://www.bioontology.org/wiki/index.php/Category:NCBO_Virtual_Appliance).
- Installing locally OLS is [possible](https://www.ebi.ac.uk/ols/docs/installation-guide), software requirements includes Maven, Neo4J, MongoDB, Tomcat, Solr.
- WebProtégé can also be [installed](https://protegewiki.stanford.edu/wiki/WebProtegeAdminGuide) among with MongoDB and Tomcat.
In all cases, local installation of these systems requires privileged (administrator-level) permissions, and their lists of requirements are important.

##### Criteria 8 - "Links to annotated resources"

The presented platforms are generic ontology browser and as expected they do not provide links towards various resources that use the EDAM ontology.

## Main functionalities

In this section, we present how each feature of the previous section are addressed by the EDAM Browser.

##### Criteria 1 and 2 - "EDAM is present and publicly available"

The EDAM Browser is publicly available (criteria 1) and does not require authentication (criteria 2). 

##### Criteria 3 - "Display of multiple parents"

Multiple parents are handled (see [for instance the link to the Phylogeny topic](https://ifb-elixirfr.github.io/edam-browser/#topic_0084)). In order to improve readability when a term is selected (1) all the term's positions are shown; and (2) all paths from the root node are highlighted (cf Fig. 1).

![The term Phylogeny has two parents](topics_tree_phylogeny.png)

##### Criteria 4 - "Can be integrated in external websites"

The ability to integrate the EDAM Browser, and its tree representation is major requirement, in order to help third party websites promoting their resources when labeled with EDAM. Both the autocomplete input field and the tree visualization are re-usable. To highlight this statement we propose a dynamic [demo](https://ifb-elixirfr.github.io/edam-browser/demo.html) showing how it can be integrated, how the user can  interact with the tree, and how to programmaticaly interact with the tree in JavaScript. 

##### Criteria 5 - "Facilitate community contributions"

Letting users contribute to the ontology improves acceptance by the community as a user propose changes to the ontology to fit his/her needs. By contribution, we mean correction of definitions, proposition of new synonyms, or even new terms. The EDAM Browser gives access to a form letting the user propose the changes and then format his/her changes in a github issue ready to be submitted by the user (cf Fig. 2). 

![The edition form and the issue created](edition_form_to_github_issue.png)

##### Criteria 6 - "Use edited version of EDAM"

Using the EDAM Browser to explore an local or development version is possible. The ontology should be in the following simplified schema which is expressed in [json schema](http://json-schema.org/). A complete version of the schema is accessible [here](https://ifb-elixirfr.github.io/edam-browser/ontology.schema.json) and an example file is [there](https://ifb-elixirfr.github.io/edam-browser/media/regular.example.json). The [edam2json utility](https://github.com/edamontology/edam2json) can be used to generate the ontology in this format from any EDAM owl file.  

<!--- https://app.quicktype.io/#l=schema helps generating schema--->

```json
{   "$ref": "#/definitions/EDAMBrowserTerm",
    "definitions": {
        "EDAMBrowserTerm": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
                "id": {"type": "string"},
                "text": {"type": "string"},
                "description": {"type": "string"},
                "children": {
                    "type": "array",
                    "items": {"$ref": "#/definitions/EDAMBrowserTerm"}
            }   },
            "required": ["id","text"],
            "title": "EDAMBrowserTerm"
}}}
```

The resulting file is loaded directly to the EDAM Browser by clicking on the button labelled _Custom_ at the top of its interface, and specifying either a public URL to the file or a local path to load it from (cf Fig. 3).

![Providing a custom ontology](custom_ontology.png)


Filling this form with the url of the example file and indicating that the identifier is accessible with `d.id` will (i) open the given file and (ii) change the url such that this configuration can be bookmarked and reopen later : [resulting link](https://ifb-elixirfr.github.io/edam-browser/?url=https%3A%2F%2Fraw.githubusercontent.com%2FIFB-ElixirFr%2Fedam-browser%2Fmaster%2Fmedia%2Fregular.example.json&identifier_accessor=d.id&text_accessor=d.text#p9&custom_url).

##### Criteria 7 - "Local installation"

The EDAM Browser can easily be downloaded and run on a personal computer. The user either open index.html and then chose to load an ontology, or starts a local web server using `python start_edam_stand_alone_browser.py` and the ontology will automatically be loaded (recommended scenario).
Once downloaded, the user can also use a custom version of the ontology, including beta version of the next release or a whole new ontology. By default, ontology should be in the [json schema](http://json-schema.org/) presented previously, but the browser can be configured to use a different schema (c.f: hereafter). A validator is available [here](https://jsonschemalint.com/).

##### Criteria 8 - "Links to annotated resources"

The EDAM Browser proposes links and statistics from several bioinformatics projects which use the EDAM ontology:
- [bio.tools](https://bio.tools) which labels software and services
- [BioSphere](https://biosphere.france-bioinformatique.fr/)[@brancotte2017biosphere] which  labels appliances,
- [Bioweb](https://bioweb.pasteur.fr) which labels software and databanks available at the Pasteur Institut 
- [TeSS](https://tess.elixir-europe.org/) which labels training materials

## Reusability

The tree-based visualization of the EDAM Browser uses [d3.js](https://d3js.org/) v4 [@d3js]. In order to make the tree re-usable we used [Javascript Closures](http://jibbering.com/faq/notes/closures/) following 
[Towards Updatable D3.js Charts](https://www.toptal.com/d3-js/towards-reusable-d3-js-charts)  and
[Towards Reusable Charts](https://bost.ocks.org/mike/chart/). It allows us to encapsulate the inner mechanics and variables of the tree while exposing methods to configure the chart and interact with it. Configuration encompasses the animation duration, if the tooltip should be used, and how we construct the html code of the tooltip. Interaction encompasses altering the elements selection, and collapsing node.

The following example comes from the [demo](https://ifb-elixirfr.github.io/edam-browser/demo.html) and shows how to visualize the ontology at `media/topic_extended.biotools.min.json` in the div `#tree` with the `Bioinformatics` term initially selected ; and after one second the element `Metagenomics` is added to the selection. Note that as the format of the file does not follow the recommendation, we have to provide a new method to access the identifier.

```javascript
my_tree = interactive_tree()
    //overriding as the identifier by default consider d.id
    .identifierAccessor(function(d){return d.data.data.uri;})
    .debug(true)           //debug enabled
    .duration(1000)        //animation duration is set to 1s
    .tooltipEnabled(true)  //tooltip will be shown chen hovering elements 
    //at first Bioinformatics should be selected
    .initiallySelectedElementHandler(function(d){
        return d.data.uri==="http://edamontology.org/topic_0091"
    })
    //call the demo (next step you see) when the tree have been loaded
    .loadingDoneHandler(demo)
;
// pre-draw/build chart in div
d3.select("#tree").call(my_tree);
//indicated where the data can be found
my_tree.data_url("media/edam_extended.biotools.min.json");
//set the element topic_3174 as selected after 1 second.
setTimeout(function() {
    my_tree.cmd.selectElement("http://edamontology.org/topic_3174", true);
}, 1000);
```


## Conclusion

The EDAM Browser allows users to browse it with an interface tailored to its structure and properties. Its interface is not designed to be a generic ontology navigation and edition platform, but rather to provide features requested by most users and contributors:
- navigation between different axes of the ontology, based on the EDAM properties that define their relationships (e.g. this *format* represents this type of *data*, this *data* is an output of this *operation* or is specific of this *topic*)
- representation of the usage of the different concepts in annotated resource collections (e.g. bio.tools, BioSphere, BioWeb, TeSS)
- architecture facilitating its local deployment and its reuse in other websites
- ability to work with edited version of the ontology with or without local installation
- encouraging community contribution to the ontology

# References
