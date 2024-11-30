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

// ancêtre commun d'Henri III et Henri IV
MATCH (p:Person)-[:PARENT_OF*1..50]->(:Person { name:'Henri III' }),
(p:Person)-[:PARENT_OF*1..50]->(:Person { name:'Henri IV' })
RETURN p.name
