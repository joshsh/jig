prefix("drugbank", "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/")
prefix("drugs", "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/")
prefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#")


namespaces.register("drugbank", "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/")
namespaces.register("drugs", "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/")
namespaces.register("rdfs", "http://www.w3.org/2000/01/rdf-schema#")

// Name of the triple store
store.name

// Number of triples in the store
store.size

// Look at a few triples
g.triples.limit(10)

// Labels (predicates) only
g.triples.limit(10).label

// Find more labels
g.triples.limit(100000).label.distinct

// Pick out a single label (rdf:type in this case)
type = g.triples.limit(100000).label.distinct[6]

// Find distinct types
g.triples(null, type, null).head.limit(100000).distinct

// Let's look at the "drugs" type
drugs = g.triples(null, type, null).head.limit(100000).distinct[1]

// Here are some instances of "drugs"
d = g.v(drugs).inE(type).limit(10).tail

// Pick a drug at random, find its neighborhood as a ranked list
d0 = g.v(d[0]).nearby(2).aggr

// Do the same for another node
d9 = g.v(d[9]).nearby(2).aggr

// Find the intersection (entry-wise product) of the two neighborhoods.
// These are nodes "nearby" to both nodes in the graph
intersect(d0, d9)
