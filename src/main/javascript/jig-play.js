

g = Jig.Graph();

dailymed = "http://www4.wiwiss.fu-berlin.de/dailymed/resource/dailymed/";
name = dailymed + "name";

r = Part.resource("http://www4.wiwiss.fu-berlin.de/dailymed/resource/drugs/2908");

g.triples(r, null, null, null).limit(10).outEdges().out();







g.triples(r, null, null, null).limit(10).tail().distinct().outEdges(null).out();
g.triples(r, null, null, null).limit(10).tail().distinct().inEdges().out();

g.triples(r, null, null, null).tail().distinct().outEdges(null).limit(10).out();
g.triples(r, null, null, null).tail().distinct().inEdges().limit(10).out();





g.triples(r, null, null, null).limit(10).tail().outEdges(null).out();




g.triples(r, null, null, null).limit(10).tail().distinct().out();
g.triples(r, null, null, null).limit(10).tail().distinct().outEdges(null).out();
