package com.franz.jig;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;

/**
 * @author Joshua Shinavier (http://fortytwo.net)
 */
public class Jig {
    private static final String
            ENDPOINT = "com.franz.jig.allegro.endpoint",
            USERNAME = "com.franz.jig.allegro.username",
            PASSWORD = "com.franz.jig.allegro.password";

    // Note: this property is used outside of Jig (e.g. in the experimental Jig Console) to refer to its current version
    public static final String VERSION = "1.0-SNAPSHOT";

    public static JigConsole loadConsole(final String propsFile,
                                         final InputStream in,
                                         final OutputStream out) throws Exception {
        File f = new File(propsFile);
        Properties config = new Properties();
        InputStream is = new FileInputStream(f);
        try {
            config.load(is);
        } finally {
            is.close();
        }

        String endpoint = config.getProperty(ENDPOINT);
        String userName = config.getProperty(USERNAME);
        String password = config.getProperty(PASSWORD);

        JigScriptEngine e = new JigScriptEngine(endpoint, userName, password);
        e.initialize();

        return new JigConsole(e, in, out);
    }

    private static void printUsage() {
        System.out.println("Usage:  jig [configuration file]");
        System.out.println("For more information, please see:\n"
                + "  <URL:https://github.com/joshsh/jig>.");
    }

    public static void main(final String[] args) {
        try {
            if (1 != args.length) {
                printUsage();
                System.exit(1);
            }
            String file = args[0];
            JigConsole c = loadConsole(file, System.in, System.out);
            c.run();
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }
}
