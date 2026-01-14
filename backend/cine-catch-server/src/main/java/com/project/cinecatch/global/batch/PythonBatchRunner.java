package com.project.cinecatch.global.batch;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;

@Slf4j
@Component
public class PythonBatchRunner {

    @Scheduled(fixedRate = 86400000, initialDelay = 10000)
    public void runPythonCrawlerEveryDay() {
        log.info(">>>>>> [Scheduled] 24시간 주기 영화관 배치 시작");

        try {
            String userDir = System.getProperty("user.dir");
            File current = new File(userDir);
            File pythonModuleDir = null;

            //경로 찾기
            if (new File(current, "event-crawler").exists()) {
                pythonModuleDir = new File(current, "event-crawler");
            } else if (new File(current.getParentFile(), "event-crawler").exists()) {
                pythonModuleDir = new File(current.getParentFile(), "event-crawler");
            }

            if (pythonModuleDir == null) {
                log.error("폴더를 찾을 수 없음");
                return;
            }

            File scriptFile = new File(pythonModuleDir, "cgv_place_db_loader.py");

            // 맥 절대 경로 설정
            String pythonPath = "/usr/bin/python3";
            if (!new File(pythonPath).exists()) pythonPath = "/usr/local/bin/python3";

            ProcessBuilder pb = new ProcessBuilder(pythonPath, scriptFile.getAbsolutePath());
            pb.directory(pythonModuleDir);
            pb.inheritIO();

            Process process = pb.start();
            int exitCode = process.waitFor();
            log.info(">>>>>> [Scheduled] 영화관 배치 종료 (Exit Code: {})", exitCode);

        } catch (Exception e) {
            log.error(">>>>>> 스케줄러 실행 중 에러 발생", e);
        }
    }
}