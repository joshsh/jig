Jig (JavaScript-based interface for graph traversal) is a graph-based programming language in the spirit of [Gremlin](https://github.com/tinkerpop/gremlin/wiki) or [Ripple](https://github.com/joshsh/ripple/wiki), but specifically geared towards [AllegroGraph](http://www.franz.com/agraph/allegrograph/) and using JavaScript syntax.

All Jig expressions are valid JavaScript, but behind the scenes, they are compiled to [Allegro Common Lisp](http://www.franz.com/products/allegrocl/), which as executes efficiently as possible in the AllegroGraph server environment.  In this way, you can easily explore a graph or incrementally build up simple programs at the [REPL](http://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), but you also have the power of the Lisp compiler if you need it for more complex and computationally intensive tasks.

Syntax reference:
* [[Jig steps]]

Here is an example of a Jig program:

```javascript
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
```

See also an [intro to Jig](http://www.youtube.com/watch?v=QFaH6IvbPiw&feature=related) on YouTube
