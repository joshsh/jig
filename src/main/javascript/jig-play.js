

g = Jig.Graph();

dailymed = "http://www4.wiwiss.fu-berlin.de/dailymed/resource/dailymed/";
rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

name = Part.resource(dailymed + "name");
type = Part.resource(rdf + "type");

r = Part.resource("http://www4.wiwiss.fu-berlin.de/dailymed/resource/drugs/2908");

g.v(r).outE(type).head().eval();





g.triples(r).limit(10).head().eval();






g.triples(r, null, null, null).limit(10).tail().distinct().outE(null).eval();
g.triples(r, null, null, null).limit(10).tail().distinct().inE().eval();

g.triples(r, null, null, null).tail().distinct().outE(null).limit(10).eval();
g.triples(r, null, null, null).tail().distinct().inE().limit(10).eval();



g.triples(r, null, null, null).limit(10).tail().distinct().outE(null).path();


g.triples(r, null, null, null).limit(10).tail().outE(null).eval();




g.triples(r, null, null, null).limit(10).tail().distinct().eval();
g.triples(r, null, null, null).limit(10).tail().distinct().outE(null).eval();



g.single(r).outE(null).eval();
g.triples(r, null, null, null).eval();
store.getTriples(r, null, null, null);

