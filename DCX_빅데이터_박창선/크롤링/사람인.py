from urllib.request import Request, urlopen, HTTPError
import re
from selenium import webdriver as wb
from selenium.webdriver.common.keys import Keys
import time
from selenium.webdriver.common.by import By
import csv
import os

# Back_end  : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=1&cat_kewd=87%2C88%2C84%2C194%2C93%2C94%2C115%2C113%2C2232&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Software  : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=192%2C184&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# System : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=319%2C185%2C186%2C189%2C320&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Database  : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=83%2C192%2C191%2C110&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Network/Security : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=85%2C90%2C104%2C111%2C114%2C190%2C193%2C112&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Front_end  : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=92%2C91&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Application : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=112%2C195&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Service : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=89%2C81&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# Game : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=80&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle
# AI : https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=2&cat_kewd=82%2C105%2C106%2C107%2C108%2C109%2C116&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle

base_url = 'https://www.saramin.co.kr/zf_user/jobs/list/job-category?page='
url_list = ['&cat_kewd=87%2C88%2C84%2C194%2C93%2C94%2C115%2C113%2C2232','&cat_kewd=192%2C184','&cat_kewd=319%2C185%2C186%2C189%2C320','&cat_kewd=83%2C192%2C191%2C110','&cat_kewd=85%2C90%2C104%2C111%2C114%2C190%2C193%2C112','&cat_kewd=92%2C91','&cat_kewd=112%2C195','&cat_kewd=89%2C81','&cat_kewd=80','&cat_kewd=82%2C105%2C106%2C107%2C108%2C109%2C116']
tail_url = '&search_optional_item=n&search_done=y&panel_count=y&isAjaxRequest=0&page_count=50&sort=RL&type=job-category&is_param=1&isSearchResultEmpty=1&isSectionHome=0&searchParamCount=1#searchTitle'
headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
num_list = [82,8,13,18,37,37,10,55,4,33]
data = [[]for _ in range(10)]           # url 저장 리스트

# 각 해쉬태그의 url들을 찾는 크롤링코드
driver = wb.Chrome()
for idx, num in enumerate(num_list):  
    for n in range(1, num+1):
        URL = base_url + str(n) + url_list[idx] + tail_url
        driver.get(url=URL)
        driver.implicitly_wait(time_to_wait=60)

        div = driver.find_elements(By.CLASS_NAME, "list_item")
        for item in div:
            tmp = item.find_element(By.TAG_NAME, "a").get_attribute('href')
            data[idx].append(tmp)
        time.sleep(2)
        
driver.close()
print('step1 done!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
print(len(data))


# 채용공고 데이터 크롤링
hashtag = ['Back_end', 'Software', 'System', 'Database', 'Network/Security', 'Front_end', 'Application', 'Service', 'Game', 'AI']
counting = 0

driver = webdriver.Chrome("chromedriver")
output_path = '/Users/parkchangseon/크롤링/saramin_data.csv'

for idx in range(len(data)):
    for url in data[idx]:
        print(url)
        driver.get(url=url)
        driver.implicitly_wait(time_to_wait=60)
        try:
            driver.switch_to.frame("iframe_content_0")
            contents = driver.find_element(By.CLASS_NAME, "user_content").text
            print(contents)
            
            saramin_data = {
            'content' : contents,
            'tag' : hashtag[idx]
            }  

            with open(output_path, 'a', encoding='utf-8', newline='') as csvfile:
                fieldnames = ['content', 'tag']
                csvwriter = csv.DictWriter(csvfile, fieldnames=fieldnames)
                csvwriter.writerow(saramin_data)

            counting += 1   
            print(counting,'번째 : ', hashtag[idx])     
            time.sleep(2)

        except:
            print('error!')
            continue

driver.close()
print('step2 done!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
print('총데이터:', counting, '개')