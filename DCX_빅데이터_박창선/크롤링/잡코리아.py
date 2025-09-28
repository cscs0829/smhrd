import time
import requests
import pandas as pd
from bs4 import BeautifulSoup

# ✅ 잡코리아 공고 크롤링 함수
def crawl_jobkorea():
    job_data = []
    BASE_URL = "https://www.jobkorea.co.kr/Search/?stext=%EB%B0%B1%EC%97%94%EB%93%9C&ord=RegDtDesc&duty=1000229%2C1000231%2C1000232%2C1000239%2C1000233&careerType=1&tabType=recruit&Page_No={}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    for i in range(1, 4):  # ✅ 1~3 페이지 크롤링
        print(f"📄 잡코리아 {i} 페이지 크롤링 중...")
        url = BASE_URL.format(i)

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        job_listings = soup.select('.list-item')  # ✅ 공고 리스트 가져오기

        for job in job_listings:
            rec_idx = int(job['data-gno']) if 'data-gno' in job.attrs else 0
            company_tag = job.select_one('.list-section-corp .corp-name-link')
            company_name = company_tag.get_text(strip=True) if company_tag else "정보 없음"
            job_title_tag = job.select_one('.list-section-information .information-title-link')
            job_title = job_title_tag.get_text(strip=True) if job_title_tag else "정보 없음"
            work_place_tag = job.select_one('.chip-information-group .chip-information-item:nth-of-type(4)')
            work_place_text = work_place_tag.get_text(strip=True) if work_place_tag else "정보 없음"
            job_sector_tag = job.select_one('.list-section-information .information-title')
            job_sector_text = job_sector_tag.get_text(strip=True).replace("\n", ", ") if job_sector_tag else "정보 없음"
            job_link = f"https://www.jobkorea.co.kr/Recruit/GI_Read/{rec_idx}" if rec_idx else "정보 없음"

            job_data.append({
                "rec_idx": rec_idx,
                "기업명": company_name,
                "공고 제목": job_title,
                "근무지": work_place_text,
                "직무": job_sector_text,
                "링크": job_link
            })

        time.sleep(1)  # ✅ 서버 부하 방지

    return job_data

# ✅ 실행 함수
def run():
    print("🔍 잡코리아 공고 크롤링 시작...")
    job_data = crawl_jobkorea()
    df = pd.DataFrame(job_data)
    df.to_csv("jobkorea_jobs.csv", index=False, encoding="utf-8-sig")
    print("✅ 크롤링 완료! CSV 파일 저장됨: jobkorea_jobs.csv")

# 실행
run()
