MATCH ()-[r]->() DELETE r;
MATCH (n) DETACH DELETE n; 

LOAD CSV WITH HEADERS FROM 'file:///humans.csv' as row
MERGE (p:Human { id:row.ID, name:row.name, king:toBoolean(row.isKing), gender:row.gender, born:coalesce(date(row.born), '0800-01-01'), dead:coalesce(date(row.dead),'2100-12-31'), aliases:split(row.aliases, '|') });

LOAD CSV WITH HEADERS FROM  'file:///spouses.csv' as row
MATCH (a:Human { id:row.husbandId })
MATCH (b:Human { id:row.wifeId })
MERGE (a)-[:SPOUSE_OF { from:coalesce(date(row.start), '0800-01-01'), to:coalesce(date(row.end), '2100-12-31') }]->(b);

LOAD CSV WITH HEADERS FROM 'file:///parents.csv' as row
MATCH (p:Human { id:row.parentId })
MATCH (c:Human { id:row.childId })
MERGE (p)-[:PARENT_OF]->(c);

LOAD CSV WITH HEADERS FROM  'file:///siblings.csv' as row
MATCH (a:Human { id:row.olderId })
MATCH (b:Human { id:row.youngerId })
MERGE (a)-[:SIBLING_OF]->(b);

LOAD CSV WITH HEADERS FROM  'file:///replacedBy.csv' as row
MATCH (a:Human { id:row.id })
MATCH (b:Human { id:row.successorId })
MERGE (a)-[:REPLACED_BY { position:row.label, domain:row.domain, date:date(row.date) }]->(b);

LOAD CSV WITH HEADERS FROM  'file:///kingPositions.csv' as row
MERGE (p:Position { id:row.positionId, label:row.label, domain:row.domain});

LOAD CSV WITH HEADERS FROM  'file:///kingPositionHolders.csv' as row
MATCH (h:Human { id:row.holderId })
MATCH (p:Position { id:row.positionId })
MERGE (p)-[:HELD_BY {from:date(row.start), to:coalesce(date(row.end),'2100-12-31')}]->(h);