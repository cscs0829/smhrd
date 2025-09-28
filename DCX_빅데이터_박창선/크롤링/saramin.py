import pandas as pd
import os
import time
from itertools import zip_longest
from selenium import webdriver
from selenium.webdriver.common.by import By

def move_next(driver, current_page, end_page):
    """
    다음 페이지로 이동하는 함수 (페이지 번호 형식, 범위 지정)
    """
    try:
        page_bar = driver.find_element(By.XPATH, '//*[@id="recruit_info_list"]/div[2]/div')
        pages = page_bar.find_elements(By.CSS_SELECTOR, 'a')

        for page in pages:
            page_num = page.text.strip()

            if page_num.isdigit() and int(page_num) > current_page and int(page_num) <= end_page:
                page.click()
                time.sleep(2)
                return int(page_num)

    except Exception as e:
        print(f"페이지 이동 중 오류 발생: {e}")

    return None

def push_data(dic, key, lst, total_len=None):
    """
    dic에 key가 없으면 새롭게 추가, 있으면 기존 value에 append
    데이터 길이가 맞지 않으면 None으로 채움
    """
    if key in dic:
        dic[key].extend(lst)
    else:
        dic[key] = lst

    if total_len and len(dic[key]) < total_len:
        dic[key].extend([None] * (total_len - len(dic[key])))

def collect_data(driver, data, title_list):
    """
    기업명, 공고제목, 직무, 링크 등 데이터 수집
    """
    contents = driver.find_element(By.CLASS_NAME, "content")

    job_tit = contents.find_elements(By.CLASS_NAME, "job_tit")
    corp_name = contents.find_elements(By.CLASS_NAME, "corp_name")
    job_day = contents.find_elements(By.CLASS_NAME, "job_day")
    job_date = contents.find_elements(By.CLASS_NAME, "date")
    job_conditions = contents.find_elements(By.CLASS_NAME, "job_condition")
    job_sector = contents.find_elements(By.CLASS_NAME, "job_sector")
    href = contents.find_elements(By.XPATH, '//*[@class="area_job"]//*[@class="job_tit"]/a')

    job_list = [job_tit, corp_name, job_day, job_date, job_conditions, job_sector, href]
    total_len = len(corp_name)

    for k, v in zip(title_list, job_list):
        if k == "조건":
            cond_str_list = ["근무지역", "경력", "학력", "근무형태", "급여"]
            cond_list = [x.text.split("\n") for x in v]

            for i in range(5):
                try:
                    val_lst = list(list(zip_longest(*cond_list, fillvalue=None))[i])
                    push_data(data, cond_str_list[i], val_lst, total_len)
                except:
                    push_data(data, cond_str_list[i], [None] * total_len)

        elif k == "링크":
            push_data(data, k, [x.get_attribute('href') for x in v], total_len)
        else:
            push_data(data, k, [x.text for x in v], total_len)

def crawling(driver, data, title_list, start_page, end_page):
    """
    지정한 범위의 페이지를 넘겨가며 데이터 수집
    """
    start = time.time()
    current_page = start_page

    while current_page <= end_page:
        time.sleep(1)
        collect_data(driver, data, title_list)

        next_page = move_next(driver, current_page, end_page)
        if next_page is None:
            break

        current_page = next_page

    end = time.time()
    print(f"{start_page}페이지부터 {end_page}페이지까지 크롤링 완료! 걸린 시간: {end - start:.1f}초")

def save_data(data, search_input):
    """
    크롤링한 데이터를 CSV 파일로 저장
    """
    try:
        df = pd.DataFrame(data)
        save_path = f'./saramin_{search_input}.csv'
        df.to_csv(save_path, header=True, index=False, encoding='utf-8-sig')
        print(f"데이터 저장 완료: {save_path}")
    except ValueError:
        print("데이터 저장 실패! ValueError: 데이터 길이가 맞지 않습니다.")
        for k, v in data.items():
            print(k, len(v))

def check_data(search_input):
    """
    저장된 데이터 확인
    """
    try:
        df = pd.read_csv(f'./saramin_{search_input}.csv')
        print(f"검색어: {search_input}")
        print(f"총 데이터 개수: {len(df)}")
        print(df.head())
    except FileNotFoundError:
        print("CSV 파일이 존재하지 않습니다. 데이터 수집을 확인하세요.")

def main():
    base_url = 'https://www.saramin.co.kr/zf_user/'
    search_url = 'search?search_area=main&search_done=y&search_optional_item=n&searchType=search&searchword='

    search_input = input("직무, 회사, 지역, 키워드로 검색해보세요: ")

    while True:
        try:
            start_page = int(input("크롤링 시작할 페이지 번호 입력: "))
            end_page = int(input("크롤링 끝낼 페이지 번호 입력: "))
            if start_page > 0 and end_page >= start_page:
                break
            else:
                print("올바른 범위를 입력하세요. (예: 1페이지부터 5페이지까지 크롤링하려면 1, 5 입력)")
        except ValueError:
            print("숫자를 입력하세요!")

    options = webdriver.ChromeOptions()
    options.add_argument('window-size=1920,1080')

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)

    driver.get(base_url + search_url + search_input)
    time.sleep(3)

    data = {}
    title_list = ["공고명", "회사명", "등록일", "지원마감일", "조건", "직무분야", "링크"]

    crawling(driver, data, title_list, start_page, end_page)
    save_data(data, search_input)
    check_data(search_input)

    driver.quit()

if __name__ == "__main__":
    main()
