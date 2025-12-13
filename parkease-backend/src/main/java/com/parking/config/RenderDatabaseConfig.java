package com.parking.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class RenderDatabaseConfig {

    /**
     * Render provides a Postgres connection string in the form:
     *   postgres://user:pass@host:port/db
     * Spring Boot expects a JDBC URL. This bean converts the Render URL to JDBC.
     *
     * Only active when DATABASE_URL looks like a postgres URI.
     */
    @Bean
    @ConditionalOnExpression(
            "!'${DATABASE_URL:}'.isEmpty() && (" +
            "'${DATABASE_URL}'.startsWith('postgres://') || " +
            "'${DATABASE_URL}'.startsWith('postgresql://')" +
            ")"
    )
    public DataSource renderPostgresDataSource(Environment environment) {
        String raw = environment.getProperty("DATABASE_URL");
        URI uri = URI.create(raw);

        String userInfo = uri.getUserInfo();
        String username = null;
        String password = null;
        if (userInfo != null) {
            String[] parts = userInfo.split(":", 2);
            username = parts[0];
            password = parts.length > 1 ? parts[1] : "";
        }

        String host = uri.getHost();
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String database = uri.getPath();
        if (database != null && database.startsWith("/")) {
            database = database.substring(1);
        }

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;

        // Optional: allow overriding sslmode (Render commonly needs 'require').
        String sslmode = environment.getProperty("DB_SSLMODE");
        if (sslmode != null && !sslmode.isBlank()) {
            jdbcUrl = jdbcUrl + "?sslmode=" + sslmode;
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setJdbcUrl(jdbcUrl);
        if (username != null) dataSource.setUsername(username);
        if (password != null) dataSource.setPassword(password);

        // Conservative pool sizing for Render free tier.
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);

        return dataSource;
    }
}
