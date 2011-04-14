var Jig = {};

/******************************************************************************/

Jig.LimitFilter = function(limit) {
    var count = 0;

    return {
        applyTo: function(arg, solutions) {
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

Jig.CursorFilter = function(cursor) {
    return {
        applyTo: function(arg, solutions) {
            var t = cursor.next();
            while (null != t) {
                if (!solutions.put(t)) {
                    // TODO: close cursor
                    return false;
                }

                t = cursor.next();
            }

            return true;
        }
    }
}

Jig.HeadFilter = function() {
    return {
        applyTo: function(arg, solutions) {
            var s = arg.object;
            return solutions.put(s);
        }
    }
}

Jig.TailFilter = function() {
    return {
        applyTo: function(arg, solutions) {
            var s = arg.subject;
            return solutions.put(s);
        }
    }
}

Jig.LabelFilter = function() {
    return {
        applyTo: function(arg, solutions) {
            var s = arg.predicate;
            return solutions.put(s);
        }
    }
}

Jig.OutEdgesFilter = function() {
    return {
        applyTo: function(arg, solutions) {
            var c = store.getTriples(arg, null, null, null);
            return new Jig.CursorFilter(c).applyTo(null, solutions);
        }
    }
}

Jig.InEdgesFilter = function() {
    return {
        applyTo: function(arg, solutions) {
            var c = store.getTriples(null, null, arg, null);
            return new Jig.CursorFilter(c).applyTo(null, solutions);
        }
    }
}

Jig.SingletonFilter = function(c) {
    return {
        applyTo: function(arg, solutions) {
            return solutions.put(c);
        }
    }
}

Jig.DistinctFilter = function() {
    var set = {};

    return {
        applyTo: function(arg, solutions) {
            if (set[arg]) {
                return true;
            } else {
                set[arg] = true;
                return solutions.put(arg);
            }
        }
    }
}

/******************************************************************************/

Jig.toNumber = function(r) {
    // TODO
    return 0;
}

/******************************************************************************/

Jig.PrintPipe = function() {
    var count = 0;
    return {
        put: function(arg) {
            count++;
            s += "  [" + count + "]  " + arg + "\n";
            return true;
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
        },

        getArray: function() {
            return array;
        }
    }
}

Jig.filterToPipe = function(filter, solutions) {
    return {
        put: function(arg) {
            return filter.applyTo(arg, solutions);
        }
    }
}

Jig.compose = function(up, down) {
    return {
        applyTo: function(arg, solutions) {
            var p = Jig.filterToPipe(down, solutions);
            return up.applyTo(arg, p);
        }
    }
}


/* Note: for "class" inheritance is limited by the subset of JavaScript which is
   supported by the JavaScript-to-Common-Lisp compiler.  This apparently does
   not include the dynamic definition and redefinition of methods. */
Jig.Generator = function(filter) {

    function extend(other) {
        return new Jig.Generator(Jig.compose(filter, other));
    }

    return {
        single: function(c) {
            return extend(new Jig.SingletonFilter(c));
        },

        distinct: function() {
            return extend(new Jig.DistinctFilter());
        },

        head: function() {
            return extend(new Jig.HeadFilter());
        },

        label: function() {
            return extend(new Jig.LabelFilter());
        },

        limit: function(l) {
            return extend(new Jig.LimitFilter(l));
        },

        inEdges: function() {
            return extend(new Jig.InEdgesFilter());
        },

        outEdges: function(label) {
            return extend(new Jig.OutEdgesFilter());
        },

        tail: function() {
            return extend(new Jig.TailFilter());
        },

        triples: function(subject, predicate, object, context) {
            var c = store.getTriples(subject, predicate, object, context);
            return extend(new Jig.CursorFilter(c));
        },

        ////////////////////////////////

        count: function() {
            var c = new Jig.CountPipe();
            filter.applyTo(null, c);
            return c.getCount();
        },

        mean: function() {
            var c = new Jig.CountPipe();
            var s = new Jig.SumPipe();
            var p = new TeePipe(c, s);
            filter.applyTo(null, p);
            return s.getSum() / c.getCount();
        },

        out: function() {
            var p = new Jig.CollectorPipe();
            filter.applyTo(null, p);
            return p.getArray();
        },

        sum: function() {
            var c = new Jig.SumPipe();
            filter.applyTo(null, c);
            return c.getSum();
        },

        getFilter: function() {
            return filter;
        },

        print: function() {
            var p = new Jig.PrintPipe();
            filter.applyTo(null, p);
            return s;
        }
    }
}

Jig.TrivialFilter = function() {
    return {
        applyTo: function(arg, solutions) {
            return solutions.put(arg);
        }
    }
}

Jig.Graph = function() {
    return new Jig.Generator(new Jig.TrivialFilter());
}
