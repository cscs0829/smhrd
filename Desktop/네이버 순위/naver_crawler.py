import asyncio
from playwright.async_api import async_playwright
import time
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NaverPriceCrawler:
    def __init__(self, use_proxy=False, proxy_server=None):
        self.browser = None
        self.context = None
        self.page = None
        self.use_proxy = use_proxy
        self.proxy_server = proxy_server or "http://127.0.0.1:8080"
        
    async def init_browser(self):
        """브라우저 초기화 - 봇 감지 우회"""
        try:
            self.playwright = await async_playwright().start()
            
            # 봇 감지 우회를 위한 브라우저 옵션
            browser_args = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled',  # 자동화 감지 방지
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',  # 이미지 로딩 비활성화로 속도 향상
                '--disable-javascript-harmony-shipping',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-field-trial-config',
                '--disable-ipc-flooding-protection'
            ]
            
            self.browser = await self.playwright.chromium.launch(
                headless=True,  # 헤드리스 모드
                args=browser_args
            )
            
            # 봇 감지 우회를 위한 컨텍스트 설정
            context_options = {
                'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'viewport': {'width': 1920, 'height': 1080},
                'locale': 'ko-KR',
                'timezone_id': 'Asia/Seoul',
                'extra_http_headers': {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0'
                }
            }
            
            # 프록시 설정 추가
            if self.use_proxy:
                context_options['proxy'] = {
                    'server': self.proxy_server
                }
                logger.info(f"프록시 사용: {self.proxy_server}")
            
            self.context = await self.browser.new_context(**context_options)
            
            self.page = await self.context.new_page()
            
            # 자동화 감지 방지를 위한 스크립트 실행
            await self.page.add_init_script("""
                // 자동화 감지 방지
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                
                // Chrome 자동화 속성 제거
                delete window.chrome;
                
                // Permissions API 모킹
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
                
                // 플러그인 정보 모킹
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                
                // 언어 정보 모킹
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['ko-KR', 'ko', 'en'],
                });
            """)
            
            # 기본 타임아웃 설정
            self.page.set_default_timeout(30000)
            
            logger.info("브라우저 초기화 완료 (봇 감지 우회 설정)")
            return True
        except Exception as e:
            logger.error(f"브라우저 초기화 실패: {e}")
            return False
    
    async def close_browser(self):
        """브라우저 종료"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
            logger.info("브라우저 종료 완료")
        except Exception as e:
            logger.error(f"브라우저 종료 실패: {e}")
    
    async def simulate_human_behavior(self):
        """인간과 유사한 행동 시뮬레이션"""
        try:
            # 랜덤한 마우스 움직임
            await self.page.mouse.move(
                x=100 + (hash(str(time.time())) % 200),
                y=100 + (hash(str(time.time())) % 200)
            )
            
            # 랜덤한 대기 시간
            await self.page.wait_for_timeout(1000 + (hash(str(time.time())) % 2000))
            
            # 페이지 하단으로 스크롤
            await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            await self.page.wait_for_timeout(500 + (hash(str(time.time())) % 1000))
            
            # 페이지 상단으로 스크롤
            await self.page.evaluate("window.scrollTo(0, 0)")
            await self.page.wait_for_timeout(500 + (hash(str(time.time())) % 1000))
            
            logger.info("인간과 유사한 행동 시뮬레이션 완료")
        except Exception as e:
            logger.warning(f"인간 행동 시뮬레이션 실패: {e}")
    
    async def human_like_typing(self, element, text):
        """인간과 유사한 타이핑"""
        try:
            # 기존 텍스트 지우기
            await element.click()
            await element.fill('')
            
            # 문자별로 천천히 타이핑
            for char in text:
                await element.type(char)
                # 랜덤한 타이핑 속도
                await self.page.wait_for_timeout(50 + (hash(char) % 100))
            
            # 타이핑 완료 후 잠시 대기
            await self.page.wait_for_timeout(500 + (hash(text) % 1000))
            
            logger.info("인간과 유사한 타이핑 완료")
        except Exception as e:
            logger.warning(f"인간 타이핑 시뮬레이션 실패: {e}")
            # 실패 시 일반적인 방법 사용
            await element.fill(text)
    
    async def scroll_page_naturally(self):
        """자연스러운 페이지 스크롤"""
        try:
            # 페이지 높이 가져오기
            page_height = await self.page.evaluate("document.body.scrollHeight")
            viewport_height = await self.page.evaluate("window.innerHeight")
            
            # 단계별로 스크롤
            current_position = 0
            while current_position < page_height:
                # 랜덤한 스크롤 거리
                scroll_distance = 200 + (hash(str(current_position)) % 300)
                current_position += scroll_distance
                
                await self.page.evaluate(f"window.scrollTo(0, {current_position})")
                
                # 랜덤한 대기 시간
                await self.page.wait_for_timeout(300 + (hash(str(current_position)) % 500))
                
                # 봇 감지 방지를 위한 랜덤한 마우스 움직임
                if hash(str(current_position)) % 3 == 0:
                    await self.page.mouse.move(
                        x=100 + (hash(str(current_position)) % 800),
                        y=100 + (hash(str(current_position)) % 600)
                    )
            
            # 다시 상단으로 스크롤
            await self.page.evaluate("window.scrollTo(0, 0)")
            await self.page.wait_for_timeout(1000)
            
            logger.info("자연스러운 페이지 스크롤 완료")
        except Exception as e:
            logger.warning(f"자연스러운 스크롤 실패: {e}")
    
    async def handle_captcha_or_bot_detection(self):
        """캡차나 봇 감지 처리"""
        try:
            # 봇 감지 페이지 확인
            page_content = await self.page.content()
            
            if "봇" in page_content or "bot" in page_content.lower() or "captcha" in page_content.lower():
                logger.warning("봇 감지 또는 캡차 페이지 발견")
                
                # 페이지 새로고침
                await self.page.reload()
                await self.page.wait_for_load_state('networkidle')
                
                # 추가 대기 시간
                await self.page.wait_for_timeout(5000 + (hash(str(time.time())) % 10000))
                
                return True
            
            return False
        except Exception as e:
            logger.warning(f"봇 감지 처리 실패: {e}")
            return False
    
    async def fallback_search_method(self, keyword):
        """대체 검색 방법 - 봇 감지 우회"""
        try:
            logger.info("대체 검색 방법 시도 중...")
            
            # 방법 1: 네이버 쇼핑 직접 URL 사용
            try:
                url = f"https://search.shopping.naver.com/search/all?query={keyword}&cat_id=&frm=NVSHATC"
                await self.page.goto(url, wait_until='networkidle')
                await self.page.wait_for_timeout(3000)
                
                # 봇 감지 확인
                if await self.handle_captcha_or_bot_detection():
                    await self.page.wait_for_timeout(5000)
                
                products = await self.extract_product_info()
                if len(products) >= 5:
                    logger.info("대체 방법 1 성공")
                    return products
            except Exception as e:
                logger.warning(f"대체 방법 1 실패: {e}")
            
            # 방법 2: 일반 검색 결과에서 쇼핑 정보 추출
            try:
                url = f"https://search.naver.com/search.naver?query={keyword}+쇼핑"
                await self.page.goto(url, wait_until='networkidle')
                await self.page.wait_for_timeout(3000)
                
                # 쇼핑 관련 결과 찾기
                products = await self.extract_shopping_from_general_search()
                if len(products) >= 3:
                    logger.info("대체 방법 2 성공")
                    return products
            except Exception as e:
                logger.warning(f"대체 방법 2 실패: {e}")
            
            # 방법 3: 모바일 버전 시도
            try:
                await self.context.set_viewport_size({'width': 375, 'height': 667})
                url = f"https://m.shopping.naver.com/search/all?query={keyword}"
                await self.page.goto(url, wait_until='networkidle')
                await self.page.wait_for_timeout(3000)
                
                products = await self.extract_product_info()
                if len(products) >= 3:
                    logger.info("대체 방법 3 (모바일) 성공")
                    return products
            except Exception as e:
                logger.warning(f"대체 방법 3 실패: {e}")
            
            logger.warning("모든 대체 방법 실패")
            return []
            
        except Exception as e:
            logger.error(f"대체 검색 방법 실행 실패: {e}")
            return []
    
    async def extract_shopping_from_general_search(self):
        """일반 검색 결과에서 쇼핑 정보 추출"""
        try:
            # 쇼핑 관련 결과 찾기
            shopping_selectors = [
                'div[class*="shopping"]',
                'div[class*="item"]',
                'div[class*="product"]',
                'a[href*="shopping"]'
            ]
            
            products = []
            
            for selector in shopping_selectors:
                try:
                    elements = await self.page.query_selector_all(selector)
                    for element in elements[:10]:
                        try:
                            # 텍스트 내용 추출
                            text = await element.text_content()
                            if text and len(text.strip()) > 10:
                                products.append({
                                    'name': text.strip()[:100],
                                    'price': '가격 정보 없음',
                                    'store': '일반 검색 결과'
                                })
                        except:
                            continue
                    
                    if products:
                        break
                except:
                    continue
            
            return products[:10]  # 최대 10개
            
        except Exception as e:
            logger.warning(f"일반 검색에서 쇼핑 정보 추출 실패: {e}")
            return []
    
    async def search_company_in_price_comparison(self, keyword, company_name):
        """모바일 네이버 검색에서 특정 회사 찾기"""
        try:
            if not await self.init_browser():
                return None
            
            # 모바일 뷰포트 설정
            await self.context.set_viewport_size({'width': 375, 'height': 812})
            
            # 1단계: 모바일 네이버 검색으로 이동
            search_url = f"https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query={keyword}"
            logger.info(f"모바일 네이버 검색으로 이동: {search_url}")
            await self.page.goto(search_url, wait_until='networkidle')
            
            # 봇 감지 확인 및 처리
            if await self.handle_captcha_or_bot_detection():
                logger.info("봇 감지 처리 후 계속 진행...")
            
            # 2단계: 가격비교 더보기 링크 찾기
            logger.info("가격비교 더보기 링크 찾는 중...")
            price_more_selectors = [
                '.storeMoreLink-mobile-module__store_more_link___M_FGp a',
                'a:has-text("네이버 가격비교 더보기")',
                '[class*="storeMoreLink"] a',
                'a[href*="msearch.shopping.naver.com"]'
            ]
            
            price_more_found = False
            for selector in price_more_selectors:
                try:
                    price_more_link = await self.page.wait_for_selector(selector, timeout=5000)
                    if price_more_link:
                        await price_more_link.click()
                        await self.page.wait_for_load_state('networkidle')
                        price_more_found = True
                        logger.info(f"가격비교 더보기 클릭 성공: {selector}")
                        break
                except:
                    continue
            
            if not price_more_found:
                logger.warning("가격비교 더보기 링크를 찾을 수 없습니다.")
                return None
            
            # 3단계: 회사 검색
            result = await self.find_company_in_results(company_name)
            if result:
                # 현재 페이지 URL 추가
                result['page_url'] = self.page.url
            return result
            
        except Exception as e:
            logger.error(f"회사 검색 실패: {e}")
            return None
        finally:
            await self.close_browser()
    
    async def find_company_in_results(self, company_name):
        """가격비교 결과에서 특정 회사의 모든 제품 찾기 - 10페이지 내"""
        try:
            current_page = 1
            max_pages = 10  # 10페이지까지만 검색
            all_products = []  # 찾은 모든 제품들
            
            while current_page <= max_pages:
                logger.info(f"{current_page}페이지에서 '{company_name}' 제품들 검색 중...")
                
                # 페이지 로딩 대기
                await self.page.wait_for_timeout(2000)
                
                # 현재 페이지에 상품이 있는지 확인
                has_products = await self.check_page_has_products()
                if not has_products:
                    logger.info(f"{current_page}페이지에 상품이 없습니다.")
                    # 빈 페이지여도 10페이지까지는 계속 검색
                else:
                    # 현재 페이지에서 회사의 모든 제품 찾기
                    page_products = await self.search_all_company_products_in_page(company_name, current_page)
                    if page_products:
                        all_products.extend(page_products)
                        logger.info(f"{current_page}페이지에서 '{company_name}' 제품 {len(page_products)}개 발견")
                
                # 10페이지가 아니면 다음 페이지로 이동
                if current_page < max_pages:
                    next_page_success = await self.go_to_next_page()
                    if not next_page_success:
                        logger.info(f"더 이상 다음 페이지가 없습니다. (마지막 페이지: {current_page})")
                        break
                
                current_page += 1
                
                # 페이지 변경 확인
                await self.page.wait_for_timeout(1000)
                actual_page = await self.get_current_page_number()
                if actual_page and actual_page != current_page:
                    logger.info(f"실제 페이지 번호 조정: {current_page} -> {actual_page}")
                    current_page = actual_page
            
            # 결과 정리
            searched_pages = min(current_page - 1, max_pages)
            
            if all_products:
                logger.info(f"'{company_name}' 제품 총 {len(all_products)}개 발견 ({searched_pages}페이지 검색)")
                return {
                    'found': True,
                    'total_products': len(all_products),
                    'products': all_products,
                    'searched_pages': searched_pages,
                    'company_name': company_name,
                    'message': f"'{company_name}' 제품 {len(all_products)}개 발견"
                }
            else:
                logger.info(f"'{company_name}' 제품을 {searched_pages}페이지까지 검색했지만 찾지 못했습니다.")
                return {
                    'found': False,
                    'total_products': 0,
                    'products': [],
                    'searched_pages': searched_pages,
                    'company_name': company_name,
                    'message': f"'{company_name}' 제품을 {searched_pages}페이지까지 검색했지만 찾지 못했습니다."
                }
            
        except Exception as e:
            logger.error(f"회사 검색 중 오류: {e}")
            return {
                'found': False,
                'total_products': 0,
                'products': [],
                'searched_pages': 0,
                'error': str(e),
                'company_name': company_name,
                'message': f"검색 중 오류가 발생했습니다: {e}"
            }
    
    async def search_all_company_products_in_page(self, company_name, page_number):
        """현재 페이지에서 회사의 모든 제품 찾기"""
        try:
            # 상품 목록 아이템들 찾기
            product_items = await self.page.query_selector_all('.product_list_item__blfKk')
            found_products = []
            
            for index, item in enumerate(product_items):
                try:
                    # 회사명 찾기
                    mall_element = await item.query_selector('.product_mall__gUvbk')
                    if mall_element:
                        mall_name = await mall_element.text_content()
                        mall_name = mall_name.strip() if mall_name else ""
                        
                        if company_name.lower() in mall_name.lower():
                            # 상품 정보 추출
                            product_info = await self.extract_product_details(item, page_number, index + 1)
                            if product_info:
                                product_info['company_name'] = mall_name
                                found_products.append(product_info)
                                logger.info(f"'{company_name}' 제품 발견! {page_number}페이지 {index + 1}번째")
                
                except Exception as e:
                    logger.warning(f"상품 {index + 1} 정보 추출 실패: {e}")
                    continue
            
            return found_products
            
        except Exception as e:
            logger.error(f"현재 페이지 검색 실패: {e}")
            return []
    
    async def search_company_in_current_page(self, company_name, page_number):
        """현재 페이지에서 회사 검색 (첫 번째만 반환 - 호환성 유지)"""
        products = await self.search_all_company_products_in_page(company_name, page_number)
        return products[0] if products else None
    
    async def extract_product_details(self, item_element, page_number, position):
        """상품 상세 정보 추출"""
        try:
            # 상품명
            product_name = ""
            name_selectors = [
                '.product_title__Mmw2K',
                '.product_link__TrAac',
                'a[class*="title"]',
                'a[class*="link"]'
            ]
            
            for selector in name_selectors:
                try:
                    name_elem = await item_element.query_selector(selector)
                    if name_elem:
                        product_name = await name_elem.text_content()
                        product_name = product_name.strip() if product_name else ""
                        if product_name:
                            break
                except:
                    continue
            
            # 가격
            price = ""
            price_selectors = [
                '.product_price__52oO9',
                '.price_num__S2p_v',
                '[class*="price"]',
                'strong[class*="price"]'
            ]
            
            for selector in price_selectors:
                try:
                    price_elem = await item_element.query_selector(selector)
                    if price_elem:
                        price = await price_elem.text_content()
                        price = price.strip() if price else ""
                        if price:
                            break
                except:
                    continue
            
            # 상품 링크
            product_link = ""
            try:
                link_elem = await item_element.query_selector('a')
                if link_elem:
                    product_link = await link_elem.get_attribute('href')
                    if product_link and not product_link.startswith('http'):
                        product_link = f"https://msearch.shopping.naver.com{product_link}"
            except:
                pass
            
            return {
                'page_number': page_number,
                'position': position,
                'product_name': product_name,
                'price': price,
                'product_link': product_link,
                'found_at': f"{page_number}페이지 {position}번째"
            }
            
        except Exception as e:
            logger.error(f"상품 상세 정보 추출 실패: {e}")
            return None
    
    async def check_page_has_products(self):
        """현재 페이지에 상품이 있는지 확인"""
        try:
            # 상품 목록 아이템들 찾기
            product_items = await self.page.query_selector_all('.product_list_item__blfKk')
            has_products = len(product_items) > 0
            
            if has_products:
                logger.info(f"현재 페이지에 {len(product_items)}개 상품 발견")
            else:
                # 다른 선택자들도 시도
                alternative_selectors = [
                    '[class*="product_item"]',
                    '[class*="product_list"]',
                    '[class*="item"]'
                ]
                
                for selector in alternative_selectors:
                    items = await self.page.query_selector_all(selector)
                    if len(items) > 0:
                        logger.info(f"대체 선택자로 {len(items)}개 아이템 발견: {selector}")
                        return True
                
                logger.info("현재 페이지에 상품이 없습니다.")
            
            return has_products
            
        except Exception as e:
            logger.warning(f"상품 존재 확인 실패: {e}")
            return True  # 오류 시 계속 진행
    
    async def get_current_page_number(self):
        """현재 페이지 번호 가져오기"""
        try:
            # 활성 페이지 번호 찾기
            active_page_selectors = [
                '.paginator_active__3C_54',
                '.paginator_inner__4ib6z .paginator_active__3C_54',
                '[class*="paginator_active"]',
                '[class*="active"]'
            ]
            
            for selector in active_page_selectors:
                try:
                    active_element = await self.page.query_selector(selector)
                    if active_element:
                        page_text = await active_element.text_content()
                        if page_text and page_text.strip().isdigit():
                            page_num = int(page_text.strip())
                            logger.info(f"현재 페이지 번호: {page_num}")
                            return page_num
                except:
                    continue
            
            return None
            
        except Exception as e:
            logger.warning(f"현재 페이지 번호 확인 실패: {e}")
            return None
    
    async def go_to_next_page(self):
        """다음 페이지로 이동 - 개선된 버전"""
        try:
            # 현재 페이지 번호 저장
            current_page_before = await self.get_current_page_number()
            
            # 다음 페이지 버튼 찾기
            pagination_selectors = [
                '.paginator_btn_next__BE1_y:not(.paginator_disabled__XpDer)',
                'button:has-text("다음리스트"):not([disabled])',
                '.paginator_inner__4ib6z button:last-child:not(.paginator_disabled__XpDer)',
                '[class*="paginator_btn_next"]:not([class*="disabled"])'
            ]
            
            for selector in pagination_selectors:
                try:
                    next_button = await self.page.wait_for_selector(selector, timeout=3000)
                    if next_button:
                        # 버튼이 비활성화되어 있는지 확인
                        is_disabled = await next_button.get_attribute('disabled')
                        has_disabled_class = await next_button.get_attribute('class')
                        
                        if not is_disabled and 'disabled' not in (has_disabled_class or '').lower():
                            # 클릭 전 페이지 URL 저장
                            url_before = self.page.url
                            
                            await next_button.click()
                            await self.page.wait_for_load_state('networkidle')
                            await self.page.wait_for_timeout(2000)
                            
                            # 페이지가 실제로 변경되었는지 확인
                            url_after = self.page.url
                            current_page_after = await self.get_current_page_number()
                            
                            if url_after != url_before or (current_page_after and current_page_after != current_page_before):
                                logger.info(f"다음 페이지로 이동 성공: {current_page_before} -> {current_page_after}")
                                return True
                            else:
                                logger.warning("다음 페이지 버튼을 클릭했지만 페이지가 변경되지 않았습니다.")
                
                except:
                    continue
            
            # 페이지 번호 직접 클릭 시도 (동적으로 생성되는 경우)
            if await self.try_click_next_page_number():
                return True
            
            logger.info("다음 페이지 버튼을 찾을 수 없거나 비활성화되어 있습니다.")
            return False
            
        except Exception as e:
            logger.error(f"다음 페이지 이동 실패: {e}")
            return False
    
    async def try_click_next_page_number(self):
        """페이지 번호를 직접 클릭하여 다음 페이지로 이동"""
        try:
            current_page = await self.get_current_page_number()
            if not current_page:
                return False
            
            next_page = current_page + 1
            
            # 다음 페이지 번호 링크 찾기
            page_number_selectors = [
                f'a:has-text("{next_page}")',
                f'button:has-text("{next_page}")',
                f'[href*="page={next_page}"]',
                f'.paginator_inner__4ib6z a:has-text("{next_page}")'
            ]
            
            for selector in page_number_selectors:
                try:
                    page_link = await self.page.query_selector(selector)
                    if page_link:
                        await page_link.click()
                        await self.page.wait_for_load_state('networkidle')
                        await self.page.wait_for_timeout(2000)
                        
                        # 페이지 변경 확인
                        new_page = await self.get_current_page_number()
                        if new_page == next_page:
                            logger.info(f"페이지 번호 직접 클릭으로 이동 성공: {current_page} -> {new_page}")
                            return True
                except:
                    continue
            
            return False
            
        except Exception as e:
            logger.warning(f"페이지 번호 직접 클릭 실패: {e}")
            return False
    
    def search_company_sync(self, keyword, company_name):
        """동기 방식으로 회사 검색 (Flask에서 사용)"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.search_company_in_price_comparison(keyword, company_name))
            loop.close()
            return result
        except Exception as e:
            logger.error(f"동기 회사 검색 실패: {e}")
            return None
            
        except Exception as e:
            logger.error(f"상품 검색 실패: {e}")
            return []
        finally:
            await self.close_browser()
    
    async def extract_product_info(self):
        """상품 정보 추출"""
        try:
            # 상품 카드 선택자들 (여러 가능한 선택자 시도)
            product_selectors = [
                'div[data-testid="product"]',
                'div.product_item__MDtDF',
                'div.basicList_item__0T9JD',
                'div.product_item',
                'div[class*="product"]',
                'div[class*="item"]'
            ]
            
            products = []
            
            for selector in product_selectors:
                try:
                    # 상품 카드들 찾기
                    product_cards = await self.page.query_selector_all(selector)
                    
                    if product_cards:
                        logger.info(f"상품 {len(product_cards)}개 발견: {selector}")
                        
                        for i, card in enumerate(product_cards[:20]):  # 상위 20개만
                            try:
                                product_info = await self.extract_single_product(card)
                                if product_info:
                                    products.append(product_info)
                            except Exception as e:
                                logger.warning(f"상품 {i+1} 정보 추출 실패: {e}")
                                continue
                        
                        if products:
                            break
                            
                except Exception as e:
                    logger.warning(f"선택자 {selector} 실패: {e}")
                    continue
            
            logger.info(f"총 {len(products)}개 상품 정보 추출 완료")
            return products
            
        except Exception as e:
            logger.error(f"상품 정보 추출 실패: {e}")
            return []
    
    async def extract_single_product(self, card):
        """단일 상품 정보 추출"""
        try:
            # 상품명
            name = ""
            name_selectors = [
                'a[data-testid="product"]',
                'a.product_link__TrAac',
                'a.basicList_link__JLQJf',
                'a[class*="link"]',
                'a[class*="title"]'
            ]
            
            for selector in name_selectors:
                try:
                    name_elem = await card.query_selector(selector)
                    if name_elem:
                        name = await name_elem.text_content()
                        name = name.strip() if name else ""
                        break
                except:
                    continue
            
            # 가격
            price = ""
            price_selectors = [
                'span[data-testid="price"]',
                'span.price_num__S2p_v',
                'span.basicList_price__eKpTX',
                'span[class*="price"]',
                'strong[class*="price"]'
            ]
            
            for selector in price_selectors:
                try:
                    price_elem = await card.query_selector(selector)
                    if price_elem:
                        price = await price_elem.text_content()
                        price = price.strip() if price else ""
                        break
                except:
                    continue
            
            # 쇼핑몰명
            store = ""
            store_selectors = [
                'a[data-testid="store"]',
                'a.store_link__TrAac',
                'a.basicList_store__2rEHc',
                'a[class*="store"]',
                'span[class*="store"]'
            ]
            
            for selector in store_selectors:
                try:
                    store_elem = await card.query_selector(selector)
                    if store_elem:
                        store = await store_elem.text_content()
                        store = store.strip() if store else ""
                        break
                except:
                    continue
            
            # 최소한의 정보가 있는 경우만 반환
            if name or price:
                return {
                    'name': name,
                    'price': price,
                    'store': store
                }
            
            return None
            
        except Exception as e:
            logger.warning(f"단일 상품 정보 추출 실패: {e}")
            return None
    
    def search_product_sync(self, keyword):
        """동기 방식으로 상품 검색 (Flask에서 사용)"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.search_product(keyword))
            loop.close()
            return result
        except Exception as e:
            logger.error(f"동기 검색 실패: {e}")
            return []

    async def search_product(self, keyword):
        """상품 검색 (비동기)"""
        try:
            if not await self.init_browser():
                return []
            
            # 네이버 쇼핑 검색
            url = f"https://search.shopping.naver.com/search/all?query={keyword}&cat_id=&frm=NVSHATC"
            await self.page.goto(url, wait_until='networkidle')
            await self.page.wait_for_timeout(3000)
            
            # 봇 감지 확인
            if await self.handle_captcha_or_bot_detection():
                await self.page.wait_for_timeout(5000)
            
            # 상품 정보 추출
            products = await self.extract_product_info()
            
            return products
            
        except Exception as e:
            logger.error(f"상품 검색 실패: {e}")
            return []
        finally:
            await self.close_browser()

# 테스트용
if __name__ == "__main__":
    async def test():
        crawler = NaverPriceCrawler()
        results = await crawler.search_product("노트북")
        print(f"검색 결과: {len(results)}개")
        for i, product in enumerate(results[:5]):
            print(f"{i+1}. {product}")
    
    asyncio.run(test())
