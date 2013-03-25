


// "_" step
g.triples.limit(10)._

// "E" step
// TODO: test it

// "V" step
var r = Part.resource("http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01603")
g.V(r)
g.V(r).outE

// "id" step
g.triples.limit(10).tail.id

// "label" step
g.triples.limit(10).label


var label = Part.resource("http://www.w3.org/2000/01/rdf-schema#label")
var meticillin = Part.literal("Meticillin");
g.V(label, meticillin)