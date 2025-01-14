// simple: date
MATCH (n:Person)
WHERE n.dead<date('1400-01-01')
RETURN n;

// simple: king
MATCH (n:Person)
WHERE n.king
RETURN n;

// simple: alias
MATCH (a:Person)
WHERE 'saint Louis' IN a.aliases
RETURN a;

// allShortestPaths
MATCH (from:Human {id:'Q7732'}),(to:Human{id:'Q517'})
MATCH p = allShortestPaths((from)-[*]-(to))
return p;

// allShortestPaths excluding relationships
MATCH (from:Human {id:'Q7732'}),(to:Human{id:'Q517'})
MATCH p = allShortestPaths((from)-[r*]-(to))
WHERE ALL (x IN RELATIONSHIPS(p) WHERE type(x)<>'REPLACED_BY' and type(x)<>'SIBLING_OF')
RETURN p

// allShortestPaths with relationships
MATCH (from:Human {id:'Q7732'}),(to:Human{id:'Q517'})
MATCH p = allShortestPaths((from)-[r*]-(to))
WHERE ALL (x IN RELATIONSHIPS(p) WHERE type(x) IN ['PARENT_OF','SPOUSE_OF'])
RETURN p

// children with age
with 0 as minAge
match (p1 :Human {id:'Q7742'})-[r1:PARENT_OF]->(h :Human where h.age > minAge)<-[r2:PARENT_OF]-(p2:Human {id:'Q152549'})
return p1,p2,h,r1,r2

//full tree
MATCH (a:Human)-[r]->(b:Human)
RETURN a, b, r;

// Généalogie (par les pères) des rois de France
MATCH (p:Human {id: "Q7771"})
CALL apoc.path.subgraphAll(p, {
	relationshipFilter: "<PARENT_OF|<REPLACED_BY",
    labelFilter: "-Woman",
    minLevel: 0,
    maxLevel: 32
})
YIELD nodes, relationships
RETURN nodes, relationships;

// add mothers (UNWIND-COLLECT)
MATCH (p:Human {id: "Q7771"})
CALL apoc.path.subgraphAll(p, {
  relationshipFilter: "<PARENT_OF|<REPLACED_BY",
  labelFilter: "-Woman",
  minLevel: 0,
  maxLevel: 32
})
YIELD nodes, relationships
WITH nodes, relationships
UNWIND nodes as n
MATCH (m:Man)<-[:PARENT_OF]-(mother:Woman) where m in nodes
RETURN nodes, relationships, collect(mother);

// add wifes
MATCH (p:Human {id: "Q7771"})
CALL apoc.path.subgraphAll(p, {
  relationshipFilter: "<PARENT_OF|<REPLACED_BY",
  labelFilter: "-Woman",
  minLevel: 0,
  maxLevel: 32
})
YIELD nodes, relationships
WITH nodes, relationships
UNWIND nodes as n
MATCH (mother:Woman)-[:PARENT_OF]->(m:Man) where m in nodes
MATCH (m:Man)-[:SPOUSE_OF]->(wife:Woman) where m in nodes
RETURN nodes, relationships, collect(mother), collect(wife);

// Henri III and Henri IV common ancestor
MATCH 
    (:Human { id:"Q53448" })<-[:PARENT_OF* {type:'father'}]-(p:Human)-[:PARENT_OF* {type:'father'}]->(:Human { id:"Q936976" })
return p

// Henri IV's fathers
MATCH (p:Human)-[r:PARENT_OF*1..50 {type:'father'} ]->(h4:Human { id:"Q936976" })
return p,r,h4

//Louis XIV's all parents
match (p:Human)-[r:PARENT_OF*1..50]->(louis14: Human {id:'Q7732'})
return p,r,louis14

// Louis XVI's all predecessors (apoc)
MATCH (p:Human {id: "Q7732"})
CALL apoc.path.subgraphAll(p, {
	relationshipFilter: "<REPLACED_BY",
    minLevel: 0,
    maxLevel: 50
})
YIELD nodes, relationships
RETURN nodes, relationships;

// Napoléon 1er et ses proches
MATCH (p:Human {id: "Q517"})
CALL apoc.path.subgraphAll(p, {
	relationshipFilter: "PARENT_OF|SPOUSE_OF|SIBLING_OF",
//    labelFilter: "-Woman",
    minLevel: 0,
    maxLevel: 3
})
YIELD nodes, relationships
RETURN nodes, relationships;

// search for all king Louis
match (h:Human) where h.name starts with 'Louis' and h.king=true return h.name, h.id, h.aliases order by h.name

// search for Henri III
match (h:Human) where h.name contains 'Henri III' return h.name, h.id, h.aliases

// search for Henri III (regex)
match (h:Human) where h.name =~ 'Henri III.*' return h.name, h.id, h.aliases

// successor is not child
match (a:King)-[r:REPLACED_BY {domain:'France'}]->(b:King)
where not (a)-[:PARENT_OF]->(b)
return *

// the longest reigns
match (:Position)-[r:HELD_BY]->(h:Human)
return h.id,h.name,h.age,r.label,r.duration order by r.duration desc limit 10
