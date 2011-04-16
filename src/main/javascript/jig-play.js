

g = Jig.Graph() \
                 \
dailymed = "http://www4.wiwiss.fu-berlin.de/dailymed/resource/dailymed/" \
owl = "http://www.w3.org/2002/07/owl#" \
rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" \
rdfs = "http://www.w3.org/2000/01/rdf-schema#" \
label = Part.resource(rdfs + "label") \
name = Part.resource(dailymed + "name") \
sameAs = Part.resource(owl + "sameAs") \
type = Part.resource(rdf + "type") \
inactiveIngredient = Part.resource(dailymed + "inactiveIngredient") \
                                    \
r = Part.resource("http://www4.wiwiss.fu-berlin.de/dailymed/resource/drugs/2908");              \
i = Part.resource("http://www4.wiwiss.fu-berlin.de/dailymed/resource/ingredient/Irbesartan");   \
drugs = Part.resource("http://www4.wiwiss.fu-berlin.de/dailymed/resource/dailymed/drugs");      \


g.v(drugs).inE(type).limit(10).tail

drug1 = g.v(drugs).inE(type).limit(10).tail[0]
drug2 = g.v(drugs).inE(type).limit(10).tail[9]

labels = g.v(drug1).bothE.label.distinct



//########################################
//# demo

g.triples(null, type, null).limit(100000).head.distinct
genes = g.triples(null, type, null).limit(100000).head.distinct[0]
targets = g.triples(null, type, null).limit(100000).head.distinct[2]

g.v(gene1).outE
g.v(target1).outE

gene1 = g.v(genes).inE(type).limit(20).tail[0]
target1 = g.v(targets).inE(type).tail[0]

...
// Bleah.  No path found.
t.breadthFirstPaths(gene1, target1, 2)



Jig.undirectedUnlabeledGenerator.neighbors(d[0], 1)


function intersect(v1, v2) {

}


t = new Generator(store, neighborNew);
t.neighbors(r, 2);
t.breadthFirstPath(drug1, drug2, 2);
t.breadthFirstPaths(drug1, drug2, 2);


t = new Generator(store, labels, labels, labels);
t.neighbors()


g.v(r).outE(type).head


g.v(r).outE(inactiveIngredient).head.outE(label).head


t = new Generator(store, type, type);
t.breadthFirstPath(r, drugs, 3);
t.depthFirstPath(r, drugs, 3);


t = new Generator(store);
 t.neighbors()


t = new Generator(store, type, type, type);

t = new Generator(store, null, null, null);
t.breadthFirstPath(r, drugs, 3);



g.triples(r).limit(10).head


g.triples(r).limit(10).tail.distinct.outE




g.triples(r).limit(10).tail.distinct.outE
g.triples(r).limit(10).tail.distinct.inE

g.triples(r).tail.distinct.outE.limit(10)
g.triples(r).tail.distinct.inE.limit(10)



g.triples(r).limit(10).tail.distinct.outE.path


g.triples(r).limit(10).tail.outE




g.triples(r).limit(10).tail.distinct
g.triples(r).limit(10).tail.distinct.outE




