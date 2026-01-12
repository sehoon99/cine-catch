import asyncio
from playwright.async_api import async_playwright
import re
import json
import os
from datetime import datetime

# --- 설정 ---
MAX_CONCURRENT_TASKS = 5
semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)

def split_event_name(full_name):
    match = re.search(r"[\[<](.*?)[\]>]", full_name)
    if match:
        movie_title = match.group(1).strip()
        full_bracket = match.group(0)
        event_title = full_name.replace(full_bracket, "").strip()
        return movie_title, re.sub(r'\s+', ' ', event_title)
    return "기타", full_name.strip()

async def get_inventory_detail(context, event_info):
    async with semaphore:
        ev_no = event_info['no']
        page = await context.new_page()
        target_url = f"https://cgv.co.kr/evt/giveawayStateDetail?saprmEvntNo={ev_no}"
        try:
            await page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
            region_selector = "ul[class*='localList'] li button"
            list_selector = "div[class*='storeListWrap'] li"
            all_region_data = {}
            try:
                await page.wait_for_selector(region_selector, timeout=5000)
                regions = await page.query_selector_all(region_selector)
                for i in range(len(regions)):
                    current_btns = await page.query_selector_all(region_selector)
                    btn = current_btns[i]
                    region_name = (await btn.inner_text()).split('(')[0].strip()
                    await btn.click(force=True)
                    await asyncio.sleep(0.5)
                    items = await page.query_selector_all(list_selector)
                    theater_list = [{"theater": (await item.inner_text()).split('\n')[0].strip(), 
                                     "status": (await item.inner_text()).split('\n')[-1].strip()} for item in items if len((await item.inner_text()).split('\n')) >= 2]
                    all_region_data[region_name] = theater_list
            except:
                items = await page.query_selector_all(list_selector)
                all_region_data["전체"] = [{"theater": (await item.inner_text()).split('\n')[0].strip(), "status": (await item.inner_text()).split('\n')[-1].strip()} for item in items if len((await item.inner_text()).split('\n')) >= 2]
            await page.close()
            return {**event_info, "event_no": ev_no, "regions": all_region_data}
        except Exception as e:
            print(f"❌ [{ev_no}] 상세 수집 실패: {e}")
            await page.close()
            return None

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(**p.devices['iPhone 13'])
        main_page = await context.new_page()
        event_data_list = []

        async def handle_response(response):
            if "searchSaprmEvtListForPage" in response.url:
                try:
                    json_data = await response.json()
                    for ev in json_data.get("data", {}).get("list", []):
                        no = ev.get("saprmEvntNo")
                        if no and not any(e['no'] == no for e in event_data_list):
                            movie, event = split_event_name(ev.get("saprmEvntNm"))
                            event_data_list.append({"no": no, "movie_title": movie, "event_title": event, "start_date": ev.get("evntStartYmd"), "end_date": ev.get("evntEndYmd")})
                except: pass

        main_page.on("response", handle_response)
        await main_page.goto("https://cgv.co.kr/evt/giveawayState", wait_until="networkidle")
        for _ in range(5): 
            await main_page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)

        tasks = [get_inventory_detail(context, ev) for ev in event_data_list]
        final_results = [r for r in await asyncio.gather(*tasks) if r]

        # --- 파일 저장 로직 ---
        # --- 파일 저장 로직 수정 ---
        # 1. 현재 실행 중인 파일(crawler.py)의 절대 경로 폴더 확보
        base_path = os.path.dirname(os.path.abspath(__file__))
        
        # 2. 해당 폴더 바로 아래에 'data' 폴더 경로 설정
        data_dir = os.path.join(base_path, "data")
        
        # 3. 'data' 폴더가 없으면 생성
        os.makedirs(data_dir, exist_ok=True)
        
        # 4. 전체 파일 경로 생성
        filename = os.path.join(data_dir, f"raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        
        # 5. 파일 저장
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(final_results, f, ensure_ascii=False, indent=4)
        
        print(f"✅ 수집 완료: {filename} 저장됨")
        # ------------------------
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())