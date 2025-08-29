# 네이버 가격비교 순위 모니터링 시스템

네이버 쇼핑에서 특정 키워드로 검색했을 때 특정 회사의 제품이 몇 페이지에 나타나는지 실시간으로 모니터링하는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **실시간 순위 모니터링**: 특정 회사의 제품이 네이버 쇼핑 검색 결과에서 몇 페이지에 나타나는지 추적
- **자동 스케줄링**: 설정된 간격으로 자동으로 순위를 체크
- **웹 대시보드**: 직관적인 웹 인터페이스로 모니터링 결과 확인
- **데이터 저장**: PostgreSQL 데이터베이스에 검색 결과 히스토리 저장
- **봇 감지 우회**: Playwright를 사용한 고급 웹 스크래핑

## 🛠️ 기술 스택

- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Web Scraping**: Playwright
- **Deployment**: Render
- **Frontend**: HTML, CSS, JavaScript

## 📋 요구사항

- Python 3.8+
- PostgreSQL
- Playwright (Chromium)

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/cscs0829/naver-ranking.git
cd naver-ranking
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. Playwright 브라우저 설치
```bash
playwright install --with-deps chromium
playwright install-deps
```

### 4. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 입력
```

### 5. 데이터베이스 초기화
```bash
python app.py
```

### 6. 애플리케이션 실행
```bash
python app.py
```

## 🌐 사용법

1. **웹 브라우저에서 접속**: `http://localhost:5000`
2. **새 검색 추가**: 검색 키워드와 찾을 회사명 입력
3. **순위 체크**: "회사 검색 시작" 버튼 클릭
4. **결과 확인**: 실시간으로 업데이트되는 순위 정보 확인

## 📊 데이터베이스 스키마

### products 테이블
- `id`: 고유 식별자
- `name`: 검색 이름
- `search_keyword`: 검색 키워드
- `company_name`: 찾을 회사명
- `check_interval`: 체크 간격 (분)
- `created_at`: 생성 시간

### rank_history 테이블
- `id`: 고유 식별자
- `product_id`: 상품 ID (외래키)
- `total_products`: 발견된 제품 수
- `searched_pages`: 검색한 페이지 수
- `found_products`: 발견된 제품 정보 (JSON)
- `summary_message`: 요약 메시지
- `checked_at`: 체크 시간

## 🚀 Render 배포

이 프로젝트는 Render에서 자동으로 배포됩니다.

### 배포 설정
- **Web Service**: Python 환경
- **Database**: PostgreSQL
- **Build Command**: Playwright 설치 포함
- **Start Command**: Gunicorn으로 Flask 앱 실행

### 환경 변수
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `USE_PROXY`: 프록시 사용 여부
- `PROXY_SERVER`: 프록시 서버 주소

## 🔧 개발

### 프로젝트 구조
```
naver-ranking/
├── app.py              # Flask 메인 애플리케이션
├── naver_crawler.py    # 네이버 크롤링 로직
├── templates/          # HTML 템플릿
│   └── index.html     # 메인 페이지
├── requirements.txt    # Python 의존성
├── render.yaml        # Render 배포 설정
├── Procfile          # Heroku 호환성
└── README.md         # 프로젝트 문서
```

### 크롤링 로직
- **봇 감지 우회**: 다양한 기술을 사용하여 봇 감지를 우회
- **인간 행동 시뮬레이션**: 자연스러운 마우스 움직임과 스크롤
- **대체 검색 방법**: 메인 방법 실패 시 여러 대체 방법 시도

## ⚠️ 주의사항

- 네이버의 이용약관을 준수하여 사용하세요
- 과도한 요청은 IP 차단을 초래할 수 있습니다
- 상업적 용도로 사용 시 법적 책임을 확인하세요

## 📝 라이선스

이 프로젝트는 교육 및 개인 사용 목적으로 제작되었습니다.

## 🤝 기여

버그 리포트나 기능 제안은 GitHub Issues를 통해 제출해주세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 GitHub Issues를 통해 연락해주세요.
