
# Entities

entity   Q https://www.wikidata.org/wiki/{ID}

Entities are entries in [Wikidata](https://www.wikidata.org).

In this project, most of those represent a Human (example: [Louis XIV: Q7742](https://www.wikidata.org/wiki/Q7742)), but some entries are values for properties.

example:

|id|meaning|used by|
|--|-------|-------|
|Q5|[Human](https://www.wikidata.org/wiki/Q5)|P31|
|Q6581072|[Female](https://www.wikidata.org/wiki/Q6581072)|P21|
|Q6581097|[Male](https://www.wikidata.org/wiki/Q6581097)|P21|

=> see [enum QualifierValue](https://github.com/ethiry/wikikings/blob/9c8970cd9585444e667e5106068c14d6baf210ee/common/enums.ts#L41)

# Properties and Qualifiers

Each entity has a list of propeties.

property P https://www.wikidata.org/wiki/Property:{ID}

tools:

* Wikidata Property Explorer: https://prop-explorer.toolforge.org/
* Wikidata Propbrowse: https://hay.toolforge.org/propbrowse/

some properties:

|id|property|
|--|--------|
|P21|[sex or gender](https://www.wikidata.org/wiki/Property:P21)|
|P22|[father](https://www.wikidata.org/wiki/Property:P22)|
|P25|[mother](https://www.wikidata.org/wiki/Property:P25)|
|P26|[spouse](https://www.wikidata.org/wiki/Property:P26)|
|P31|[instance of](https://www.wikidata.org/wiki/Property:P31)|
|P39|[position held](https://www.wikidata.org/wiki/Property:P39)|
|P40|[child](https://www.wikidata.org/wiki/Property:P40)|
|P53|[family](https://www.wikidata.org/wiki/Property:P53)|
|P569|[date of birth](https://www.wikidata.org/wiki/Property:P569)|
|P570|[date of death](https://www.wikidata.org/wiki/Property:P570)|
|P3373|[sibling](https://www.wikidata.org/wiki/Property:P3373)|

=> see [enum StatemenId](https://github.com/ethiry/wikikings/blob/9c8970cd9585444e667e5106068c14d6baf210ee/common/enums.ts#L19)

All properties have a value of a certain type, such as 
* a value entity (identified by Q...) for example for P22 (father) or P21 (gender)
* a date for example for P569 (date of birth)

Example of generic entities used as values for properties


Some properties can have one or more qualifiers as well. Qualifiers are properties (identified by P..) with values and properties.

Example of qualifiers:

|id|qualifier|used by property|
|--|---------|----------------|
|P580|[start date](https://www.wikidata.org/wiki/Property:P580)|P26, P39|
|P582|[end date](https://www.wikidata.org/wiki/Property:P582)|P26, P39|
|P1365|[replaces](https://www.wikidata.org/wiki/Property:P1365)|P39|
|P1366|[replaced by](https://www.wikidata.org/wiki/Property:P1366)|P39|

=> see [enum QualifierId](https://github.com/ethiry/wikikings/blob/9c8970cd9585444e667e5106068c14d6baf210ee/common/enums.ts#L34)

# Wikibase API

swagger: https://doc.wikimedia.org/Wikibase/master/js/rest-api/

In this project I didn't use the API directly, but NPM module wikibase-sdk (https://www.npmjs.com/package/wikibase-sdk)