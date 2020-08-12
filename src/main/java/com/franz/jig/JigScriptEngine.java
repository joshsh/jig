package com.franz.jig;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineFactory;
import javax.script.ScriptException;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

/**
 * @author Joshua Shinavier (http://fortytwo.net)
 */
public class JigScriptEngine implements ScriptEngine {
    private static final String[] steps = new String[]{
            "_",
            "bothE",
            "common",
            "distinct",
            "E",
            "ends",
            "head",
            "id",
            "inE",
            "label",
            "limit",
            "nearby",
            "out",
            "outE",
            "tail",
            "triples",
            "V",
    };
    private static final String[] methods = new String[]{
            "aggr",
            "count",
            "eval",
            "mean",
            "path",
            "sum",
    };
    private static final Map<String, String> aliases = new HashMap<String, String>() {{
        put("e", "E");
        put("v", "V");
    }};

    private static final Collection<String> keywords;

    static {
        keywords = new LinkedList<String>();
        keywords.addAll(Arrays.asList(steps));
        keywords.addAll(Arrays.asList(methods));
    }

    private final String endpoint;
    private final String userName;
    private final String password;
    private final HttpClient client;

    public JigScriptEngine(final String session,
                           final String userName,
                           final String password) {
        this.endpoint = fixSession(session) + "/eval";
        this.userName = userName;
        this.password = password;
        client = createHttpClient();
    }

    public Object eval(final String script,
                       final ScriptContext context) throws ScriptException {
        throw new UnsupportedOperationException();
    }

    public Object eval(final Reader reader,
                       final ScriptContext context) throws ScriptException {
        throw new UnsupportedOperationException();
    }

    public Object eval(final String script) throws ScriptException {
        try {
            return issueRequest(transformScript(script));
        } catch (IOException e) {
            throw new ScriptException(e);
        } catch (JSONException e) {
            throw new ScriptException(e);
        }
    }

    private String fixSession(final String session) {
        String example = "http://example.org/catalogs/mycat/repositories/myrepo/session/9091/sessions/23593b0f-eab5-3b04-4d64-003048fde8f8";

        if (!session.startsWith("http")) {
            throw new IllegalArgumentException("session identifier must be a complete URL." +
                    " Valid session URLs look like '" + example + "'");
        }
        if (!session.contains("repositories") || !session.contains("session")) {
            throw new IllegalArgumentException("invalid session URL." +
                    " Valid session URLs look like '" + example + "'");
        }

        // Session URLs provided by AGWebView for repositories in the default catalog
        // contain a "#" character, but the URL expected for POST must exclude the "#".
        int i = session.indexOf('#');
        return i > -1
                ? session.substring(0, i) + session.substring(i + 1)
                : session;
    }

    private String transformScript(final String script) {
        // Emulate method metaprogramming at a syntactic level (since the JavaScript-to-Lisp compiler doesn't support it)
        String r = script.trim();
        while (r.endsWith(";")) {
            r = r.substring(0, r.length() - 1).trim();
        }
        for (String k : keywords) {
            r = r.replaceAll("[.]" + k + "[.]", "." + k + "().");
            r = r.replaceAll("[.]" + k + "\\[", "." + k + "()[");
            r = r.replaceAll("[.]" + k + "$", "." + k + "()");
            //r = r.replaceAll("[.]" + k + "\\s*;", "." + k + "();");
        }
        for (String k : aliases.keySet()) {
            r = r.replaceAll("[.]" + k + "[.]", "." + aliases.get(k) + "().");
            r = r.replaceAll("[.]" + k + "\\[", "." + aliases.get(k) + "()[");
            r = r.replaceAll("[.]" + k + "$", "." + aliases.get(k) + "()");
            //r = r.replaceAll("[.]" + k + "\\s*;", "." + aliases.get(k) + "();");
            r = r.replaceAll("[.]" + k + "\\(", "." + aliases.get(k) + "(");
        }
        r = cleanParens(r);
        r = cleanBrackets(r);
        for (String step : steps) {
            if (r.endsWith("." + step)) {
                r = r + ".eval()";
                break;
            }
        }

        //System.out.println("transformed script: " + r);

        return r;
    }

    // appends an ".eval()" for raw steps
    // e.g. "foo.head()" becomes "foo.head().eval()"
    // note: this is an expensive operation
    private String cleanParens(final String r) {
        if (r.endsWith(")")) {
            int i = r.lastIndexOf("(");
            String s = r.substring(0, i);
            for (String step : steps) {
                if (s.endsWith("." + step)) {
                    return r + ".eval()";
                }
            }
        }

        return r;
    }

    private String cleanBrackets(final String r) {
        if (r.endsWith("]")) {
            int i = r.lastIndexOf("[");
            return cleanParens(r.substring(0, i)) + r.substring(i);
        } else {
            return r;
        }
    }

    public Object eval(final Reader reader) throws ScriptException {
        throw new UnsupportedOperationException();
    }

    public Object eval(final String script,
                       final Bindings bindings) throws ScriptException {
        throw new UnsupportedOperationException();
    }

    public Object eval(final Reader reader,
                       final Bindings bindings) throws ScriptException {
        throw new UnsupportedOperationException();
    }

    public void put(final String key,
                    final Object value) {
        throw new UnsupportedOperationException();
    }

    public Object get(final String key) {
        throw new UnsupportedOperationException();
    }

    public Bindings getBindings(final int scope) {
        throw new UnsupportedOperationException();
    }

    public void setBindings(final Bindings bindings,
                            final int i) {
        throw new UnsupportedOperationException();
    }

    public Bindings createBindings() {
        throw new UnsupportedOperationException();
    }

    public ScriptContext getContext() {
        throw new UnsupportedOperationException();
    }

    public void setContext(final ScriptContext context) {
        throw new UnsupportedOperationException();
    }

    public ScriptEngineFactory getFactory() {
        throw new UnsupportedOperationException();
    }

    private static HttpClient createHttpClient() {
        // TODO: additional settings, e.g. agent identity
        return new DefaultHttpClient();
    }

    private Object issueRequest(final String script) throws IOException, JSONException, ScriptException {
        HttpPost request = new HttpPost(endpoint);
        request.setHeader("Content-Type", "text/javascript");
        request.setHeader("Accept", "application/json");
        request.setEntity(new StringEntity(script));
        String auth = new String(Base64.encodeBase64((userName + ":" + password).getBytes()));
        request.setHeader("Authorization", "Basic " + auth);

        //long before = new Date().getTime();
        HttpResponse response = client.execute(request);
        //long after = new Date().getTime();
        //System.out.println("[request took " + (after - before) + "ms]");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        response.getEntity().writeTo(bos);
        String result = bos.toString();

        int responseCode = response.getStatusLine().getStatusCode();
        if (responseCode != 200) {
            throw new ScriptException("Jig request failed with error code " + responseCode +
                    ": " + result);
        }
        //System.out.println("here is the result: " + result);
        //System.out.println("response: " + responseCode);

        return interpretResponse(result.trim());
    }

    private Object interpretResponse(final String s) throws JSONException {
        if (s.startsWith("[")) {
            return new JSONArray(s);
        } else if (s.startsWith("{")) {
            return new JSONObject(s);
        } else {
            //JSONArray a = new JSONArray("[\"" + s + "\"]");
            //return a.get(0);
            return s;
        }
    }

    public void initialize() throws ScriptException {
        InputStream is = Jig.class.getResourceAsStream("jig.js");
        final String s;
        try {
            try {
                s = convertStreamToString(is);
            } finally {
                is.close();
            }
        } catch (IOException e) {
            throw new ScriptException(e);
        }

        eval(s);
    }

    private String convertStreamToString(final InputStream is)
            throws IOException {
        if (is != null) {
            Writer writer = new StringWriter();

            char[] buffer = new char[1024];
            try {
                Reader reader = new BufferedReader(
                        new InputStreamReader(is, "UTF-8"));
                int n;
                while ((n = reader.read(buffer)) != -1) {
                    writer.write(buffer, 0, n);
                }
            } finally {
                is.close();
            }
            return writer.toString();
        } else {
            return "";
        }
    }
}
