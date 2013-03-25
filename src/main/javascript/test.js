

// "E" step
// TODO: test it

// "V" step
var r = Part.resource("http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01603")
g.V(r)
g.V(r).outE

// "_" step
g.triples.limit(10)._

// "id" step
g.triples.limit(10).tail.id