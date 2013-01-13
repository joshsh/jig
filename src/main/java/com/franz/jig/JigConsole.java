package com.franz.jig;

import jline.ConsoleReader;
import jline.SimpleCompletor;
import org.json.JSONArray;
import org.json.JSONException;

import javax.script.ScriptEngine;
import javax.script.ScriptException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintStream;
import java.util.HashMap;
import java.util.Map;

/**
 * An interactive command-line interface for <code>JigScriptEngine</code>.
 *
 * @author Joshua Shinavier (http://fortytwo.net)
 */
public class JigConsole {
    private static final Map<String, String> PREFIX_FOR_NAMESPACE;

    private final ScriptEngine scriptEngine;
    private final ConsoleReader reader;
    private final PrintStream ps;

    static {
        PREFIX_FOR_NAMESPACE = new HashMap<String, String>();
        try {
            addCommonNamespaces();
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private String previous = "";
    private int lineNumber = 0;

    public JigConsole(final ScriptEngine scriptEngine,
                      final InputStream in,
                      final OutputStream out) throws IOException {
        this.scriptEngine = scriptEngine;
        this.ps = new PrintStream(out);
        reader = new ConsoleReader(in, new OutputStreamWriter(out));

        reader.addCompletor(new SimpleCompletor(new String[]{
                "Jig",
                "Graph",
                ".distinct()",
                ".head()",
                ".label()",
                ".limit(",
                ".inEdges()",
                "null",
                ".outEdges()",
                ".tail()",
                ".triples("
        }));
    }

    public void run() throws ScriptException, IOException, JSONException {
        while (readLine()) {
        }
    }

    public boolean readLine() throws ScriptException, IOException, JSONException {
        ++lineNumber;

        String prefix = "jig)  ";
//        String prefix = "" + lineNumber + ")  ";
        String line = reader.readLine(prefix);

        return null != line && parseLine(line, true);
    }

    public boolean parseLine(final String line,
                             final boolean padOutput) throws ScriptException, JSONException {
        String s = line.trim();

        boolean cont = s.endsWith("\\");
        if (cont) {
            s = s.substring(0, s.length() - 1).trim();
        }

        if (previous.length() > 0) {
            if (cont) {
                if (s.length() > 0) {
                    previous += "\n" + s;
                }
                return true;
            } else {
                s = previous + s;
                previous = "";
                return executeScript(s, padOutput);
            }
        } else {
            if (cont) {
                if (s.length() > 0) {
                    previous = s + "\n";
                }
                return true;
            } else {
                return s.length() == 0 || executeScript(s, padOutput);
            }
        }
    }

    private boolean executeScript(final String script,
                                  final boolean padOutput) throws ScriptException, JSONException {
        //long before = new Date().getTime();

        if (padOutput) {
            ps.println("");
        }
        Object result = scriptEngine.eval(script.trim());
        showResult(result);
        if (padOutput) {
            ps.println("");
        }

        //long after = new Date().getTime();
        //System.out.println("[script took " + (after - before) + "ms]");

        // TODO: provide a "quit" command
        return true;
    }

    private void showResult(final Object result) throws JSONException {
        if (result instanceof JSONArray) {
            JSONArray a = (JSONArray) result;
            // Note: 0-indexed (so as to align result indexes with JavaScript array indexes)
            for (int i = 0; i < a.length(); i++) {
                ps.println("  [" + i + "]  "
                        + a.get(i));
                //    + prettifyResult(a.get(i).toString()));
            }
        } else {
            ps.println("  [0]  " + result);
        }
    }

    static final String test = "  [0]  [\"<http://data.linkedct.org/resource/intervention/41635>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01029>\"]\n";// +

    /*   "  [1]  [\"<http://data.linkedct.org/resource/intervention/41600>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01234>\"]\n" +
    "  [2]  [\"<http://data.linkedct.org/resource/intervention/41582>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01229>\"]\n" +
    "  [3]  [\"<http://data.linkedct.org/resource/intervention/41553>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01202>\"]\n" +
    "  [4]  [\"<http://data.linkedct.org/resource/intervention/41551>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01202>\"]\n" +
    "  [5]  [\"<http://data.linkedct.org/resource/intervention/41550>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01202>\"]\n" +
    "  [6]  [\"<http://data.linkedct.org/resource/intervention/41528>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB01229>\"]\n" +
    "  [7]  [\"<http://data.linkedct.org/resource/intervention/41526>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB00959>\"]\n" +
    "  [8]  [\"<http://data.linkedct.org/resource/intervention/41518>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB00958>\"]\n" +
    "  [9]  [\"<http://data.linkedct.org/resource/intervention/41501>\",\"<http://www.w3.org/2002/07/owl#sameAs>\",\"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB00959>\"]";
    */
    private static String prettifyResult(final String before) {
        StringBuilder sb = new StringBuilder();
        int i = 0, j;
        while (true) {
            j = before.indexOf("\"<", i);
            //System.out.println("j = " + j + " (i=" + i + ")");
            if (j < 0) {
                sb.append(before.substring(i));
                return sb.toString();
            } else {
                int k = before.indexOf(">\"", j);
                //System.out.println("  k = " + k);
                String uri = before.substring(j + 2, k);
                //System.out.println("  uri = " + uri);
                boolean found = false;
                for (String ns : PREFIX_FOR_NAMESPACE.keySet()) {
                    if (uri.startsWith(ns)) {
                        //System.out.println("  (i, j) = " + "(" + i + ", " + j + ")");
                        sb.append(before.substring(i, j));
                        sb.append(PREFIX_FOR_NAMESPACE.get(ns));
                        sb.append(":");
                        sb.append(uri.substring(ns.length()));
                        //System.out.println("sb: " + sb.toString());
                        i = k + 2;
                        if (i >= before.length()) {
                            return sb.toString();
                        }
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    sb.append(before.substring(i, k));
                    i = k;
                }
            }
        }
    }

    public static void main(final String[] args) throws Exception {
        System.out.println(prettifyResult(test));
    }

    private static void addCommonNamespaces() throws IOException {
        InputStream is = Jig.class.getResourceAsStream("common-namespaces.txt");
        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            String l;
            while ((l = br.readLine()) != null) {
                l = l.trim();
                if (0 < l.length() && !l.startsWith("#")) {
                    int i = l.indexOf("\t");
                    String prefix = l.substring(0, i);
                    String uri = l.substring(i + 1);

                    PREFIX_FOR_NAMESPACE.put(uri, prefix);
                }
            }
        } finally {
            is.close();
        }
    }
}

