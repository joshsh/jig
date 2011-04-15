package com.tinkerpop.jig;

import jline.ConsoleReader;
import jline.SimpleCompletor;
import org.json.JSONArray;
import org.json.JSONException;

import javax.script.ScriptEngine;
import javax.script.ScriptException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;

/**
 * An interactive command-line interface for <code>JigScriptEngine</code>.
 */
public class JigConsole {
    private final ScriptEngine scriptEngine;
    private final ConsoleReader reader;

    private String previous = "";
    private int lineNumber = 0;

    public JigConsole(final InputStream in,
                      final ScriptEngine scriptEngine) throws IOException {
        this.scriptEngine = scriptEngine;
        reader = new ConsoleReader(in, new OutputStreamWriter(System.out));

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

    private boolean readLine() throws ScriptException, IOException, JSONException {
        ++lineNumber;

        String prefix = "jig)  ";
//        String prefix = "" + lineNumber + ")  ";
        String line = reader.readLine(prefix);

        return null != line && tryLine(line);
    }

    private boolean tryLine(final String line) throws ScriptException, JSONException {
        String s = line.trim();

        boolean cont = s.endsWith("\\");
        if (cont) {
            s = s.substring(0, s.length() - 1).trim();
        }

        if (previous.length() > 0) {
            if (cont) {
                if (s.length() > 0) {
                    previous += "\n";
                }
                return true;
            } else {
                previous = "";
                return executeScript(previous + s);
            }
        } else {
            if (cont) {
                if (s.length() > 0) {
                    previous = s + "\n";
                }
                return true;
            } else {
                return s.length() == 0 || executeScript(s);
            }
        }
    }

    private boolean executeScript(final String script) throws ScriptException, JSONException {
        System.out.println("");
        Object result = scriptEngine.eval(script.trim());
        showResult(result);
        System.out.println("");

        // TODO: provide a "quit" command
        return true;
    }

    private void showResult(final Object result) throws JSONException {
        if (result instanceof JSONArray) {
            JSONArray a = (JSONArray) result;
            for (int i = 0; i < a.length(); i++) {
                System.out.println("  [" + (i + 1) + "]  " + a.get(i));
            }
        } else {
            System.out.println("  [1]  " + result);
        }
    }
}

