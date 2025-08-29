from flask import Flask, render_template, request, jsonify
import psycopg2
import psycopg2.extras
import schedule
import threading
import time
from datetime import datetime
from naver_crawler import NaverPriceCrawler
import os
import json

app = Flask(__name__)

def get_db_connection():
    """PostgreSQL 데이터베이스 연결"""
    try:
        # Render에서 제공하는 DATABASE_URL 사용
        database_url = os.getenv('DATABASE_URL')
        if database_url and database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        
        conn = psycopg2.connect(database_url or os.getenv('DATABASE_URL'))
        return conn
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return None

# 데이터베이스 초기화
def init_db():
    conn = get_db_connection()
    if not conn:
        print("데이터베이스 연결 실패")
        return
    
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            search_keyword TEXT NOT NULL,
            company_name TEXT NOT NULL,
            check_interval INTEGER DEFAULT 30,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rank_history (
            id SERIAL PRIMARY KEY,
            product_id INTEGER,
            total_products INTEGER,
            searched_pages INTEGER,
            found_products TEXT,
            summary_message TEXT,
            checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    conn.commit()
    conn.close()

# 크롤러 인스턴스 (프록시 사용 옵션)
use_proxy = os.getenv('USE_PROXY', 'false').lower() == 'true'
proxy_server = os.getenv('PROXY_SERVER', 'http://127.0.0.1:8080')
crawler = NaverPriceCrawler(use_proxy=use_proxy, proxy_server=proxy_server)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '데이터베이스 연결 실패'}), 500
    
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products ORDER BY created_at DESC')
    products = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': p[0],
        'name': p[1],
        'search_keyword': p[2],
        'company_name': p[3],
        'check_interval': p[4],
        'created_at': p[5]
    } for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    name = data.get('name')
    search_keyword = data.get('search_keyword')
    company_name = data.get('company_name')
    check_interval = data.get('check_interval', 30)
    
    if not name or not search_keyword or not company_name:
        return jsonify({'error': '상품명, 검색키워드, 회사명이 모두 필요합니다'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '데이터베이스 연결 실패'}), 500
    
    cursor = conn.cursor()
    cursor.execute('INSERT INTO products (name, search_keyword, company_name, check_interval) VALUES (%s, %s, %s, %s) RETURNING id', 
                   (name, search_keyword, company_name, check_interval))
    product_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': product_id, 
        'name': name, 
        'search_keyword': search_keyword,
        'company_name': company_name,
        'check_interval': check_interval
    })

@app.route('/api/products/<int:product_id>/ranks', methods=['GET'])
def get_product_ranks(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '데이터베이스 연결 실패'}), 500
    
    cursor = conn.cursor()
    cursor.execute('''
        SELECT total_products, searched_pages, found_products, summary_message, checked_at 
        FROM rank_history 
        WHERE product_id = %s 
        ORDER BY checked_at DESC 
        LIMIT 20
    ''', (product_id,))
    ranks = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'total_products': r[0],
        'searched_pages': r[1],
        'found_products': r[2],
        'summary_message': r[3],
        'checked_at': r[4]
    } for r in ranks])

@app.route('/api/check-ranks', methods=['POST'])
def check_ranks():
    """수동으로 순위 체크"""
    try:
        # 모든 상품의 순위를 체크
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': '데이터베이스 연결 실패'}), 500
            
        cursor = conn.cursor()
        cursor.execute('SELECT id, search_keyword, company_name FROM products')
        products = cursor.fetchall()
        conn.close()
        
        results = []
        for product_id, keyword, company_name in products:
            try:
                company_result = crawler.search_company_sync(keyword, company_name)
                
                # 검색 결과 저장
                conn = get_db_connection()
                if not conn:
                    results.append({
                        'product_id': product_id,
                        'keyword': keyword,
                        'company_name': company_name,
                        'status': 'error',
                        'message': '데이터베이스 연결 실패'
                    })
                    continue
                
                cursor = conn.cursor()
                
                if company_result and company_result.get('found', False):
                    # 찾은 경우
                    found_products_json = json.dumps(company_result.get('products', []), ensure_ascii=False)
                    
                    cursor.execute('''
                        INSERT INTO rank_history (product_id, total_products, searched_pages, found_products, summary_message)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (product_id, company_result['total_products'], company_result['searched_pages'], 
                          found_products_json, company_result['message']))
                    conn.commit()
                    conn.close()
                    
                    results.append({
                        'product_id': product_id,
                        'keyword': keyword,
                        'company_name': company_name,
                        'total_products': company_result['total_products'],
                        'searched_pages': company_result['searched_pages'],
                        'status': 'success'
                    })
                else:
                    # 못찾은 경우
                    searched_pages = company_result.get('searched_pages', 10) if company_result else 10
                    message = company_result.get('message', f'{company_name} 제품을 찾지 못했습니다') if company_result else f'{company_name} 제품을 찾지 못했습니다'
                    
                    cursor.execute('''
                        INSERT INTO rank_history (product_id, total_products, searched_pages, found_products, summary_message)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (product_id, 0, searched_pages, '[]', message))
                    conn.commit()
                    conn.close()
                    
                    results.append({
                        'product_id': product_id,
                        'keyword': keyword,
                        'company_name': company_name,
                        'total_products': 0,
                        'searched_pages': searched_pages,
                        'message': message,
                        'status': 'not_found'
                    })
            except Exception as e:
                results.append({
                    'product_id': product_id,
                    'keyword': keyword,
                    'company_name': company_name,
                    'error': str(e),
                    'status': 'error'
                })
        
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def scheduled_rank_check():
    """스케줄된 순위 체크"""
    with app.app_context():
        try:
            conn = get_db_connection()
            if not conn:
                print("데이터베이스 연결 실패")
                return
                
            cursor = conn.cursor()
            cursor.execute('SELECT id, search_keyword, company_name FROM products')
            products = cursor.fetchall()
            conn.close()
            
            for product_id, keyword, company_name in products:
                try:
                    company_result = crawler.search_company_sync(keyword, company_name)
                    
                    # 검색 결과 저장
                    conn = get_db_connection()
                    if not conn:
                        print(f"상품 {keyword}에서 회사 {company_name} 검색 실패: 데이터베이스 연결 실패")
                        continue
                    
                    cursor = conn.cursor()
                    
                    if company_result and company_result.get('found', False):
                        # 찾은 경우
                        found_products_json = json.dumps(company_result.get('products', []), ensure_ascii=False)
                        
                        cursor.execute('''
                            INSERT INTO rank_history (product_id, total_products, searched_pages, found_products, summary_message)
                            VALUES (%s, %s, %s, %s, %s)
                        ''', (product_id, company_result['total_products'], company_result['searched_pages'], 
                              found_products_json, company_result['message']))
                        conn.commit()
                        conn.close()
                        
                        print(f"상품 {keyword}에서 회사 {company_name} 제품 {company_result['total_products']}개 발견")
                    else:
                        # 못찾은 경우
                        searched_pages = company_result.get('searched_pages', 10) if company_result else 10
                        message = company_result.get('message', f'{company_name} 제품을 찾지 못했습니다') if company_result else f'{company_name} 제품을 찾지 못했습니다'
                        
                        cursor.execute('''
                            INSERT INTO rank_history (product_id, total_products, searched_pages, found_products, summary_message)
                            VALUES (%s, %s, %s, %s, %s)
                        ''', (product_id, 0, searched_pages, '[]', message))
                        conn.commit()
                        conn.close()
                        
                        print(f"상품 {keyword}에서 회사 {company_name} 제품 미발견: {searched_pages}페이지까지 검색")
                except Exception as e:
                    print(f"상품 {keyword}에서 회사 {company_name} 검색 실패: {e}")
        except Exception as e:
            print(f"스케줄된 순위 체크 실패: {e}")

def run_scheduler():
    """스케줄러 실행"""
    schedule.every(30).minutes.do(scheduled_rank_check)  # 30분마다 체크
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == '__main__':
    init_db()
    
    # 백그라운드에서 스케줄러 실행
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
