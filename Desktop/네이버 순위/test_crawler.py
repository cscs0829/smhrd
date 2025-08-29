#!/usr/bin/env python3
"""
네이버 크롤러 테스트 스크립트
"""

import asyncio
from naver_crawler import NaverPriceCrawler

async def test_crawler():
    """크롤러 테스트"""
    print("🔄 네이버 모바일 회사 검색 크롤러 테스트 시작...")
    print("🚀 봇 감지 우회 기능이 활성화되어 있습니다.")
    
    # 프록시 사용 옵션 (필요시)
    use_proxy = False  # True로 설정하여 프록시 사용
    proxy_server = "http://127.0.0.1:8080"  # 프록시 서버 주소
    
    crawler = NaverPriceCrawler(use_proxy=use_proxy, proxy_server=proxy_server)
    
    try:
        # 테스트 데이터
        test_cases = [
            {"keyword": "베트남여행", "company": "하나투어"},
            {"keyword": "노트북", "company": "삼성"},
            {"keyword": "스마트폰", "company": "애플"}
        ]
        
        for case in test_cases:
            keyword = case["keyword"]
            company = case["company"]
            print(f"\n🔍 '{keyword}'에서 '{company}' 회사 검색 중...")
            
            result = await crawler.search_company_in_price_comparison(keyword, company)
            
            if result and result.get('found', False):
                print(f"✅ '{company}' 제품 {result['total_products']}개 발견!")
                print(f"   📊 검색 범위: {result['searched_pages']}페이지")
                print(f"   💬 메시지: {result['message']}")
                
                if result.get('products'):
                    print(f"   📦 발견된 제품들:")
                    for i, product in enumerate(result['products'][:3]):  # 상위 3개만 표시
                        print(f"      {i+1}. {product['found_at']} - {product['product_name']}")
                        print(f"         💰 {product['price']}")
                        if product.get('product_link'):
                            print(f"         🔗 {product['product_link']}")
                    
                    if len(result['products']) > 3:
                        print(f"      ... 외 {len(result['products']) - 3}개 더")
                        
                if result.get('page_url'):
                    print(f"   📄 페이지 링크: {result['page_url']}")
            else:
                if result:
                    print(f"❌ '{company}' 제품을 찾지 못했습니다.")
                    print(f"   📊 검색 범위: {result.get('searched_pages', 0)}페이지")
                    print(f"   💬 메시지: {result.get('message', '검색 실패')}")
                else:
                    print(f"❌ '{company}'를 '{keyword}' 검색에서 찾지 못했습니다.")
                
    except Exception as e:
        print(f"❌ 테스트 실패: {e}")
    
    print("\n🏁 테스트 완료")

if __name__ == "__main__":
    asyncio.run(test_crawler())
