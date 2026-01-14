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

    private String getPythonPath() {
        return "python3"; // 시스템이 알아서 찾음
    }

    @Scheduled(fixedRate = 86400000, initialDelay = 1000)
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

            ProcessBuilder pb = new ProcessBuilder("python3", scriptFile.getAbsolutePath());
            pb.directory(pythonModuleDir);
            pb.inheritIO();

            Process process = pb.start();
            int exitCode = process.waitFor();
            log.info(">>>>>> [Scheduled] 영화관 배치 종료 (Exit Code: {})", exitCode);

        } catch (Exception e) {
            log.error(">>>>>> 스케줄러 실행 중 에러 발생", e);
        }
    }

    // 매시 정각마다 실행 (0분 0초)
    @Scheduled(fixedRate = 3600000, initialDelay = 1000)
    public void runEventUpdateBatch() {
        log.info(">>>>>> [Scheduled] 이벤트 정보 업데이트 배치 시작(1시간 주기)");

        try {
            String userDir = System.getProperty("user.dir");
            File current = new File(userDir);

            // 경로 찾기
            File pythonModuleDir = getPythonModuleDir(current);
            if (pythonModuleDir == null) return;

            // 파이썬 인터프리터 경로
            String pythonPath = getPythonPath();

            // STEP 1: 크롤링 (crawler.py)
            boolean crawlerSuccess = runProcess(pythonPath, pythonModuleDir, "crawler.py");

            if (crawlerSuccess) {
                log.info(">>>>>> STEP 1 성공: 크롤링 완료, 로딩 시작");

                // STEP 2: DB 적재 (loader.py)
                boolean loaderSuccess = runProcess(pythonPath, pythonModuleDir, "loader.py");

                if (loaderSuccess) {
                    log.info(">>>>>> STEP 2 성공: DB 적재까지 모두 완료");
                } else {
                    log.error(">>>>>> STEP 2 실패: DB 적재 중 에러 발생");
                }
            } else {
                log.error(">>>>>> STEP 1 실패: 크롤링이 실패, 로딩 스킵");
            }

        } catch (Exception e) {
            log.error(">>>>>> 배치 실행 중 치명적 에러 발생", e);
        }
    }

    // 프로세스 실행 공통 메서드
    private boolean runProcess(String pythonPath, File workingDir, String scriptName) {
        try {
            File scriptFile = new File(workingDir, scriptName);
            log.info("실행 중: {}", scriptName);

            ProcessBuilder pb = new ProcessBuilder(pythonPath, scriptFile.getAbsolutePath());
            pb.directory(workingDir);
            pb.inheritIO();

            Process process = pb.start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            log.error("{} 실행 중 에러: {}", scriptName, e.getMessage());
            return false;
        }
    }

    private File getPythonModuleDir(File current) {
        if (new File(current, "event-crawler").exists()) return new File(current, "event-crawler");
        if (new File(current.getParentFile(), "event-crawler").exists()) return new File(current.getParentFile(), "event-crawler");
        log.error("event-crawler 폴더를 찾을 수 없음~함!");
        return null;
    }


}