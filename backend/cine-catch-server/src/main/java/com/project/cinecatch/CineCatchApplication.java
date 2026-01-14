package com.project.cinecatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling  // <--- 이게 없으면 @Scheduled가 다 무시됨
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class CineCatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineCatchApplication.class, args);
    }

}
