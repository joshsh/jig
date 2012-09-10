package com.tinkerpop.jig;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

/**
 * @author Joshua Shinavier (http://fortytwo.net)
 */
public class Jig {
    private static final String
            ENDPOINT = "com.tinkerpop.jig.allegro.endpoint",
            USERNAME = "com.tinkerpop.jig.allegro.username",
            PASSWORD = "com.tinkerpop.jig.allegro.password";

    public static void main(final String[] args) {
        try {
            if (1 != args.length) {
                printUsage();
                System.exit(1);
            }
            String file = args[0];
            run(file);
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }

    private static void printUsage() {
        System.out.println("Usage:  jig [configuration file]");
        System.out.println("For more information, please see:\n"
                + "  <URL:https://github.com/joshsh/jig>.");
    }

    private static void run(final String propsFile) throws Exception {
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

        JigConsole c = new JigConsole(System.in, e);
        c.run();
    }
}
