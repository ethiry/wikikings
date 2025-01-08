// delete all
MATCH (a:Person)-[r]->(b:Person)
DETACH DELETE a, b, r;

// full tree
MATCH (a:Person)-[r]->(b:Person)
RETURN a, b, r;

MATCH (n:Person)
WHERE n.dead<date('1400-01-01')
RETURN n;

MATCH (n:Person)
WHERE n.king
RETURN n;

MATCH (a:Person)
WHERE 'saint Louis' IN a.aliases
RETURN a;

// common ancester for Henri III and Henri IV
MATCH (p:Person)-[:PARENT_OF*1..50]->(:Person { name:'Henri III' }),
(p:Person)-[:PARENT_OF*1..50]->(:Person { name:'Henri IV' })
RETURN p.name

// Louis XIV's parents
match (p:Person)-[r:PARENT_OF*1..50]->(louis14: Person {name: 'Louis XIV'})
return p,r,louis14

// count Louis XIV's parents
match (p:Person)-[r:PARENT_OF*1..50]->(:Person {name: 'Louis XIV'})
return count(r)

// Louis XIV's predecessors
match (p:Person)-[r:REPLACED_BY*1..50]->(louis14: Person {name: 'Louis XIV'})
return p,r,louis14
