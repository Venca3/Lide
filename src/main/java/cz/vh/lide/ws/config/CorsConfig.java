package cz.vh.lide.ws.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configure CORS for the application.
 *
 * - In development the frontend uses Vite proxy so CORS is typically not needed.
 * - In production set allowed origins via `app.cors.allowed-origins` env or property.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

  @Value("${app.cors.allowed-origins:}")
  private String allowedOrigins; // comma separated

  @Override
  public void addCorsMappings(@org.springframework.lang.NonNull CorsRegistry registry) {
    var mapping = registry.addMapping("/api/**");
    if (allowedOrigins != null && !allowedOrigins.isBlank()) {
      String[] origins = allowedOrigins.split(",");
      // remove blank entries
      java.util.List<String> list = new java.util.ArrayList<>();
      for (String s : origins) {
        if (s != null && !s.isBlank()) list.add(s.trim());
      }
      mapping.allowedOrigins(list.toArray(new String[0]))
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    } else {
      // default: allow none (secure)
      mapping.allowedOrigins();
    }
    mapping.allowCredentials(true).allowedHeaders("*").maxAge(3600);
  }
}
