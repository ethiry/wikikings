MATCH (a:Person)-[r]->(b:Person)
DETACH DELETE a, b, r;

LOAD CSV WITH HEADERS FROM 'file:///humans.csv' as row
MERGE (p:Person { id:row.ID, name:row.name, king:toBoolean(row.isKing), gender:row.gender, born:date(row.born), dead:date(row.dead), aliases:split(row.aliases, '|') });

LOAD CSV WITH HEADERS FROM  'file:///spouses.csv' as row
MATCH (a:Person { id:row.husbandId })
MATCH (b:Person { id:row.wifeId })
MERGE (a)-[:SPOUSE_OF]->(b);
//MERGE (a)-[:SPOUSE_OF { from:coalesce(date(row.start), '9999-12-31'), to:coalesce(date(row.end), '9999-12-31') }]->(b);

LOAD CSV WITH HEADERS FROM 'file:///parents.csv' as row
MATCH (p:Person { id:row.parentId })
MATCH (c:Person { id:row.childId })
MERGE (p)-[:PARENT_OF]->(c);

LOAD CSV WITH HEADERS FROM  'file:///siblings.csv' as row
MATCH (a:Person { id:row.olderId })
MATCH (b:Person { id:row.youngerId })
MERGE (a)-[:SIBLING_OF]->(b);

LOAD CSV WITH HEADERS FROM  'file:///replacedBy.csv' as row
MATCH (a:Person { id:row.id })
MATCH (b:Person { id:row.successorId })
MERGE (a)-[:REPLACED_BY { position:row.label, date:date(row.date) }]-(b);

LOAD CSV WITH HEADERS FROM  'file:///kingPositions.csv' as row
MERGE (p:Position { id:row.positionId, label:row.label});

LOAD CSV WITH HEADERS FROM  'file:///kingPositionHolders.csv' as row
MATCH (h:Person { id:row.holderId })
MATCH (p:Position { id:row.positionId })
MERGE (h)-[:HELD]->(p);