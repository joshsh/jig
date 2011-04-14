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
 * A command-line interpreter/browser which coordinates user interaction with a Ripple query engine.
 */
public class JigConsole {
    private final ScriptEngine scriptEngine;
    private final ConsoleReader reader;

    private int lineNumber = 0;

    public JigConsole(final InputStream in,
                      final ScriptEngine scriptEngine) throws IOException {
        this.scriptEngine = scriptEngine;
        reader = new ConsoleReader(in, new OutputStreamWriter(System.out));

        reader.addCompletor(new SimpleCompletor(new String[] {
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
        while (true) {
            readLine();
        }
    }

    private void readLine() throws ScriptException, IOException, JSONException {
        ++lineNumber;
        String prefix = "" + lineNumber + ")  ";
        String line = reader.readLine(prefix);
        //System.out.println("done reading the line: " + line);

        if (null != line && line.length() > 0) {
            System.out.println("");
            Object result = scriptEngine.eval(line.trim());
            //System.out.println("[] result: " + result);
            showResult(result);
            System.out.println("");
        }
    }

    private void showResult(final Object result) throws JSONException {
        if (result instanceof JSONArray) {
            JSONArray a = (JSONArray) result;
            for (int i = 0; i < a.length(); i++) {
                System.out.println("  [" + (i+1) + "]  " + a.get(i));
            }
        } else {
            System.out.println("  [1]  " + result);
        }
    }
}

