package org.example.portfolioservice.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 도메인 (로그인 서비스 도메인 포함)
//        configuration.addAllowedOrigin("http://localhost:3000");  // 프론트엔드
//        configuration.addAllowedOrigin("http://localhost:8080");  // 로그인 서비스

        // 허용할 HTTP 메서드
        configuration.addAllowedMethod("*");

        // 허용할 헤더
        configuration.addAllowedHeader("*");

        // 쿠키 전송 허용 (중요!)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
