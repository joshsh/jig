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
            SESSION = "com.franz.jig.session",
            USERNAME = "com.franz.jig.username",
            PASSWORD = "com.franz.jig.password";

    private static JigConsole loadConsole(final String propsFile,
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

        String session = config.getProperty(SESSION);
        String userName = config.getProperty(USERNAME);
        String password = config.getProperty(PASSWORD);

        JigScriptEngine e = new JigScriptEngine(session, userName, password);
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
