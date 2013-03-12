var Jig = {};

/* helper functions ***********************************************************/

function pushCursor(cursor, solutions) {
    var t = cursor.next();
    while (null != t) {
        if (!solutions.put(t)) {
            cursor.close();
            return false;
        }

        t = cursor.next();
    }

    cursor.close();
    return true;
}

function neighbors(r) {
    var hash = new UPIHash();
    var val = {};

    var c = store.getTriples(r, null, null, null);
    var t = c.next();
    while (null != t) {
        hash.set(t.object, val);
        t = c.next();
    }
    c.close();

    c = store.getTriples(null, null, r, null);
    t = c.next();
    while (null != t) {
        hash.set(t.subject, val);
        t = c.next();
    }
    c.close();

    return hash.keys();
}

function compareWeighted(v1, v2) {
    return v1[0] - v2[0];
}

// Please forgive me for using bubble sort.  It's just so easy.
function sortVector(array) {
  var x, y, tmp;
  // The Bubble Sort method.
  for(x = 0; x < array.length; x++) {
    for(y = 0; y < (array.length-1); y++) {
      if(compareWeighted(array[y], array[y+1]) > 0) {
        tmp = array[y+1];
        array[y+1] = array[y];
        array[y] = tmp;
      }
    }
  }
}

function toHash(weightArray) {
    var hash = new UPIHash();
    for (var i = 0; i < weightArray.length; i++) {
        var b = weightArray[i];
        hash.set(b[1], b[0]);
    }
    return hash;
}

function toArray(hash) {

}

function union(v1, v2) {

}

function intersect(v1, v2) {
    var hash1 = toHash(v1);
    var result = new Array();
    var k = 0;

    for (var i = 0; i < v2.length; i++) {
        var b = v2[i];
        var w2 = b[0];
        var v = b[1];
        if (0 < w2) {
            var w1 = hash1.get(v);
            if (null != w1 || 0 < w1) {
                var w = w1 * w2;
                // Dunno why this extra check is necessary, but it seems to be.
                if (w > 0) {
                    var c = new Array();
                    c[0] = w1 * w2;
                    c[1] = v;
                    result[k] = c;
                    k++;
                }
            }
        }
    }

    sortVector(result);
    return result;
}

Jig.toNumber = function(r) {
    // TODO
    return 0;
}

Jig.compose = function(up, down) {
    return {
        id: "c(" + up.id + ", " + down.id + ")",
        apply: function(solutions) {
            return up.apply(down.apply(solutions));
        }
    }
}

/* global objects *************************************************************/

Jig.undirectedUnlabeledGenerator = new Generator(store, neighbors);


/* filters ********************************************************************/

Jig.CommonFilter = function(v1, v2, depth) {
    if (null == depth) {
        depth = 2;
    }
    return {
        id: "common",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var a = Jig.undirectedUnlabeledGenerator.breadthFirstPaths(v1, v2, depth);
                    for (var i = 0; i < a.length; i++) {
                        var p = a[i];
                        var r = new Array();
                        for (var j = 0; j < p.length - 2; j++) {
                            r[j] = p[j + 1];
                        }
                        if (!solutions.put(r)) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        }
    }
}

Jig.DistinctFilter = function() {
    return {
        id: "distinct",
        apply: function(solutions) {
            var set = {};
            return {
                put: function(arg) {
                    if (set[arg]) {
                        return true;
                    } else {
                        set[arg] = true;
                        return solutions.put(arg);
                    }
                }
            }
        }
    }
}

Jig.HeadFilter = function() {
    return {
        id: "head",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var s = arg.object;
                    return solutions.put(s);
                }
            }
        }
    }
}

Jig.InEdgesFilter = function(predicate) {
    return {
        id: "inEdges",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var c = store.getTriples(null, predicate, arg, null);
                    return pushCursor(c, solutions);
                }
            }
        }
    }
}

Jig.LabelFilter = function() {
    return {
        id: "label",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var s = arg.predicate;
                    return solutions.put(s);
                }
            }
        }
    }
}

Jig.LimitFilter = function(limit) {
    return {
        id: "limit",
        apply: function(solutions) {
            var count = 0;

            return {
                put: function(arg) {
                    if (count < limit) {
                        solutions.put(arg);
                        count++;
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    }
}

Jig.NearbyFilter = function(steps) {
    return {
        id: "nearby",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var a = Jig.undirectedUnlabeledGenerator.neighbors(arg, steps);
                    for (var i = 0; i < a.length; i++) {
                        if (!solutions.put(a[i])) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
    }
}

Jig.NeighborsFilter = function() {
    return {
        id: "neighbors",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var c = store.getTriples(arg, null, null, null);
                    var t = c.next();
                    while (null != t) {
                        if (!solutions.put(t.object)) {
                            c.close();
                            return false;
                        }
                        t = c.next();
                    }
                    c.close();

/*
                    c = store.getTriples(null, null, arg, null);
                    t = c.next();
                    while (null != t) {
                        if (!solutions.put(t.subject)) {
                            c.close();
                            return false;
                        }
                        t = c.next();
                    }
                    c.close();
*/

                    return true;
                }
            }
        }
    }
}

Jig.OptionFilter = function(other) {
    return {
        id: "option",
        apply: function(solutions) {
            var p = other.apply(solutions);
            return {
                put: function(arg) {
                    return solutions.put(arg) && p.put(arg);
                }
            }
        }
    }
}

Jig.OutEdgesFilter = function(predicate) {
    return {
        id: "outEdges",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var c = store.getTriples(arg, predicate, null, null);
                    return pushCursor(c, solutions);
                }
            }
        }
    }
}

Jig.SingletonFilter = function(c) {
    return {
        id: "singleton",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    return solutions.put(c);
                }
            }
        }
    }
}

Jig.TailFilter = function() {
    return {
        id: "tail",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var s = arg.subject;
                    return solutions.put(s);
                }
            }
        }
    }
}

Jig.TeeFilter = function(filter1, filter2) {
    return {
        id: "tee(" + filter1.id + ", " + filter2.id + ")",
        apply: function(solutions) {
            var p1 = filter1.apply(solutions);
            var p2 = filter2.apply(solutions);
            return {
                put: function(arg) {
                    return p1.put(arg) && p2.put(arg);
                }
            }
        }
    }
}

Jig.TriplesFilter = function(subject, predicate, object, context) {
    return {
        id: "triples",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    var c = store.getTriples(subject, predicate, object, context);
                    return pushCursor(c, solutions);
                }
            }
        }
    }
}

Jig.TrivialFilter = function() {
    return {
        id: "trivial",
        apply: function(solutions) {
            return {
                put: function(arg) {
                    return solutions.put(arg);
                }
            }
        }
    }
}


/* pipes **********************************************************************/

Jig.AggregatePipe = function(min) {
    if (null == min) {
        min = -1;
    }
    var hash = new UPIHash();
    return {
        put: function(arg) {
            var val = hash.get(arg);

            if (null == val) {
                val = 0;
            }
            val += 1;

            hash.set(arg, val);
            return true;
        },

        getVector: function() {
            var a = new Array();
            var keys = hash.keys();
            var k = 0;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var val = hash.get(key);
                if (min < 0 || val >= min) {
                    var b = new Array();
                    b[0] = val;
                    b[1] = key;
                    a[k] = b;
                    k++;
                }
            }

            //return a.sort(compareWeighted);
            sortVector(a);
            return a;
        }
    }
}

Jig.CollectorPipe = function() {
    var array = new Array();
    var count = 0;

    return {
        put: function(arg) {
            array[count] = arg;
            count++;
            return true;
        },

        getArray: function() {
            return array;
        }
    }
}

Jig.CountPipe = function() {
    var count = 0;
    return {
        put: function(arg) {
            count++;
            return true;
        },

        getCount: function() {
            return count;
        }
    }
}

Jig.SumPipe = function() {
    var sum = 0;
    return {
        put: function(arg) {
            sum += Jig.toNumber(arg);
            return true;
        },

        getSum: function() {
            return sum;
        }
    }
}

Jig.TeePipe = function(pipe1, pip2) {
    return {
        put: function(arg) {
            return pipe1.put(arg) && pip2.put(arg);
        }
    }
}


/* generator ******************************************************************/

/* Note: for "class" inheritance is limited by the subset of JavaScript which is
   supported by the JavaScript-to-Common-Lisp compiler.  This apparently does
   not include the dynamic definition and redefinition of methods. */
Jig.Generator = function(filter) {

    function extend(other) {
        return new Jig.Generator(Jig.compose(filter, other));
    }

    return {
        aggr: function(limit) {
            var c = new Jig.AggregatePipe(limit);
            filter.apply(c).put(null);
            return c.getVector();
        },

        bothE: function(predicate) {
            return extend(new Jig.TeeFilter(
                    new Jig.InEdgesFilter(predicate),
                    new Jig.OutEdgesFilter(predicate)));
        },

        common: function(v1, v2, depth) {
            return extend(new Jig.CommonFilter(v1, v2, depth));
        },

        count: function() {
            var c = new Jig.CountPipe();
            filter.apply(c).put(null);
            return c.getCount();
        },

        distinct: function() {
            return extend(new Jig.DistinctFilter());
        },

        e: function(c) {
            return extend(new Jig.SingletonFilter(c));
        },

        // Gremlin's bothV
        ends: function() {
            return extend(new Jig.TeeFilter(
                    new Jig.HeadFilter(),
                    new Jig.TailFilter()));
        },

        eval: function() {
            var p = new Jig.CollectorPipe();
            filter.apply(p).put(null);
            return p.getArray();
        },

        head: function() {
            return extend(new Jig.HeadFilter());
        },

        inE: function(predicate) {
            return extend(new Jig.InEdgesFilter(predicate));
        },

        label: function() {
            return extend(new Jig.LabelFilter());
        },

        limit: function(lim) {
            return extend(new Jig.LimitFilter(lim));
        },

        mean: function() {
            var c = new Jig.CountPipe();
            var s = new Jig.SumPipe();
            var p = new TeePipe(c, s);
            filter.apply(p).put(null);
            return s.getSum() / c.getCount();
        },

        nearby: function(steps) {
            var f = filter;
            var o = new Jig.OptionFilter(new Jig.NeighborsFilter());
            for (var i = 0; i < steps; i++) {
                f = Jig.compose(f, o);
            }

            return new Jig.Generator(f);
            //return extend(new Jig.NearbyFilter(steps));
        },

        outE: function(predicate) {
            return extend(new Jig.OutEdgesFilter(predicate));
        },

        path: function() {
            return filter.id;
        },

        sum: function() {
            var c = new Jig.SumPipe();
            filter.apply(c).put(null);
            return c.getSum();
        },

        tail: function() {
            return extend(new Jig.TailFilter());
        },

        triples: function(subject, predicate, object, context) {
            return extend(new Jig.TriplesFilter(subject, predicate, object, context));
        },

        v: function(c) {
            return extend(new Jig.SingletonFilter(c));
        },

        ////////////////////////////////

        _getFilter: function() {
            return filter;
        }
    }
}

/* ... ******************************************************************/

Jig.Graph = function() {
    return new Jig.Generator(new Jig.TrivialFilter());
}

g = new Jig.Graph();
