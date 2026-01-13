package com.project.cinecatch.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cine-Catch API")
                        .version("1.0.0")
                        .description("영화 및 공연 정보 조회 및 예매 관련 API")
                        .contact(new Contact()
                                .name("Cine-Catch Team")
                                .email("support@cine-catch.com")))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Local Development Server"))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Production Server"));
    }
}