import humans
````
load csv with headers from 'file:///humans.csv' as row
merge (p:Person {id:row.ID, name:row.name, king:toBoolean(row.isKing), born:date(row.born), dead:date(row.dead)})
return p
```

create parent-child relationships
````
LOAD CSV WITH HEADERS from 'file:///parents.csv' as row
MATCH (p:Person {id:row.parentId})
MATCH (c:Person {id:row.childId})
MERGE (p)-[:PARENT_OF]->(c);
```

create siblings relationships
```
LOAD CSV from 'file:///siblings.csv' as row
MATCH (a:Person {id:row[0]})
MATCH (b:Person {id:row[1]})
MERGE (a)-[:SIBLING_OF]->(b);
```

create replacedBy relationships
```
LOAD CSV WITH HEADERS from 'file:///replacedBy.csv' as row
MATCH (a:Person {id:row.id})   
MATCH (b:Person {id:row.successorId}) 
MERGE (a)-[:REPLACED_BY {position:row.label, date:date(row.date)}]-(b)
```

sample queries
```
match (a:Person)-[r]-(b:Person) return a,r,b
match (n:Person) where n.dead<date('1400-01-01') return n
match (n:Person) where n.king return n
```