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

/* filters ********************************************************************/

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

/* pipes **********************************************************************/

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

/* generator ******************************************************************/

/* Note: for "class" inheritance is limited by the subset of JavaScript which is
   supported by the JavaScript-to-Common-Lisp compiler.  This apparently does
   not include the dynamic definition and redefinition of methods. */
Jig.Generator = function(filter) {

    function extend(other) {
        return new Jig.Generator(Jig.compose(filter, other));
    }

    return {
        e: function(c) {
            return extend(new Jig.SingletonFilter(c));
        },

        v: function(c) {
            return extend(new Jig.SingletonFilter(c));
        },

        distinct: function() {
            return extend(new Jig.DistinctFilter());
        },

        // Gremlin's bothV
        ends: function() {
            return extend(new Jig.TeeFilter(
                    new Jig.HeadFilter(),
                    new Jig.TailFilter()));
        },

        head: function() {
            return extend(new Jig.HeadFilter());
        },

        label: function() {
            return extend(new Jig.LabelFilter());
        },

        limit: function(lim) {
            return extend(new Jig.LimitFilter(lim));
        },

        bothE: function(predicate) {
            return extend(new Jig.TeeFilter(
                    new Jig.InEdgesFilter(predicate),
                    new Jig.OutEdgesFilter(predicate)));
        },

        inE: function(predicate) {
            return extend(new Jig.InEdgesFilter(predicate));
        },

        outE: function(predicate) {
            return extend(new Jig.OutEdgesFilter(predicate));
        },

        tail: function() {
            return extend(new Jig.TailFilter());
        },

        triples: function(subject, predicate, object, context) {
            return extend(new Jig.TriplesFilter(subject, predicate, object, context));
        },

        ////////////////////////////////

        count: function() {
            var c = new Jig.CountPipe();
            filter.apply(c).put(null);
            return c.getCount();
        },

        mean: function() {
            var c = new Jig.CountPipe();
            var s = new Jig.SumPipe();
            var p = new TeePipe(c, s);
            filter.apply(p).put(null);
            return s.getSum() / c.getCount();
        },

        eval: function() {
            var p = new Jig.CollectorPipe();
            filter.apply(p).put(null);
            return p.getArray();
        },

        path: function() {
            return filter.id;
        },

        sum: function() {
            var c = new Jig.SumPipe();
            filter.apply(c).put(null);
            return c.getSum();
        }
    }
}

Jig.Graph = function() {
    return new Jig.Generator(new Jig.TrivialFilter());
}
