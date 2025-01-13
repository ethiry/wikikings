# WikiKings

WikiKings download data from Wikidata.org and generates csv files for importing into a [Neo4j](https://neo4j.com/) graph database.<br>
It's written in Typescript and is run with [deno](https://deno.land/).

Example:
```
deno run dump --startId Q7742 --levelMax 4 --language fr
````

Starting with Q7742 [Louis XIV](https://www.wikidata.org/wiki/Q7742), WikiKings will download the data for Louis XIV from wikidata.org.
It will find the parents, spouses and children and start again with them, with a depth of 4, meaning it will stop when Louis XIV's  grand-grand-grand-parents and grand-grand-grand-children are reached.<br>
In addition, predecessors and successors for all titles of King (or Queen, Emperor, ...) are searched too, with no limit.
This way, if the starting point is a King, the whole dynasty will be fetched.<br>
The scenario above yields about 1500 persons.

With
```
deno run dump -l 4 -L fr -s Q7771 -s Q348183 -s Q155596 -s Q556917 -s Q720944 -s Q536615  -s Q337057
```
about 5000 persons are retrieved, with the complete french monarchy (from Hugues Capet to Louis-Philippe), and a good coverage of other european monarchies.

The "position held" property in wikidata is used to determine if a person is a King or not. For the moment (to be improved), only some positions are considered as King.<br>
To each position is associated a "domain" representing the area where the title apply, reflecting the changes during history.<br>
See [position.ts](https://github.com/ethiry/wikikings/blob/9027c9a2908a2e1f70fc5839bb9dd7f41fb6afc2/models/position.ts#L8) for details.

Wikidata objects are saved as json file in cache folder (each object is download only once) and csv files are created in output folder (see config.json).

Note that all names in the DB will be in the language selectd in the command line, but wikidata objects downloaded and kept in cache include names in all language.

Import csv files into Neo4j with the load.cypher script.

For Neo4j Desktop:
1. copy the csv files to the import folder
1. run load.cypher script

If you test with Aura, you can:
1. upload the csv files to a web server
1. in load.cypher replace the file:/// URLs with http://yourserver/file.csv
1. run load.cypher in Aura

File queries.cypher include some sample queries you can run with the data.



# Visual Studio Code

Install the official "Deno" extension by denoland.


Make sure this is in settings.json:
```
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "denoland.vscode-deno"
  }, 
```
