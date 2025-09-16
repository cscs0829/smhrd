import fs from 'fs'
import path from 'path'
import xlsxPkg from 'xlsx'
const { readFile: xlsxReadFile, utils: xlsxUtils } = xlsxPkg

const CANDIDATE_FILES = [
  'ep데이터.xlsx',
  'ep데이터.xlsx',
  'EP데이터.xlsx',
]

const headerMap = {
  '상품ID': 'id',
  '상품명': 'title',
  'PC가격': 'price_pc',
  '혜택가': 'benefit_price',
  '정가': 'normal_price',
  '링크': 'link',
  '모바일링크': 'mobile_link',
  '이미지링크': 'image_link',
  '추가이미지링크': 'add_image_link',
  '동영상URL': 'video_url',
  '카테고리1': 'category_name1',
  '카테고리2': 'category_name2',
  '카테고리3': 'category_name3',
  '카테고리4': 'category_name4',
  '브랜드': 'brand',
  '제조사': 'maker',
  '원산지': 'origin',
  '연령대': 'age_group',
  '성별': 'gender',
  '도시': 'city',
  // 아래는 이미 영문 헤더로 들어오는 경우가 많아 신원 매핑만 유지
  'naver_category': 'naver_category',
  'naver_product_id': 'naver_product_id',
  'condition': 'condition',
  'import_flag': 'import_flag',
  'parallel_import': 'parallel_import',
  'order_made': 'order_made',
  'product_flag': 'product_flag',
  'adult': 'adult',
  'goods_type': 'goods_type',
  'barcode': 'barcode',
  'manufacture_define_number': 'manufacture_define_number',
  'brand_certification': 'brand_certification',
  'card_event': 'card_event',
  'event_words': 'event_words',
  'coupon': 'coupon',
  'partner_coupon_download': 'partner_coupon_download',
  'interest_free_event': 'interest_free_event',
  'point': 'point',
  'installation_costs': 'installation_costs',
  'search_tag': 'search_tag',
  'group_id': 'group_id',
  'vendor_id': 'vendor_id',
  'coordi_id': 'coordi_id',
  'minimum_purchase_quantity': 'minimum_purchase_quantity',
  'review_count': 'review_count',
  'shipping': 'shipping',
  'attribute': 'attribute',
  'option_detail': 'option_detail',
  'seller_id': 'seller_id',
}

function findExcelPath() {
  const cwd = process.cwd()
  for (const name of CANDIDATE_FILES) {
    const p = path.join(cwd, name)
    if (fs.existsSync(p)) return p
    const inPublic = path.join(cwd, 'public', name)
    if (fs.existsSync(inPublic)) return inPublic
  }
  const files = fs.readdirSync(cwd).filter(f => /ep.*\.xlsx$/i.test(f))
  if (files.length) return path.join(cwd, files[0])
  return null
}

function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL'
  const str = String(value)
  return "'" + str.replace(/'/g, "''") + "'"
}

function normalizeHeader(h) {
  const t = String(h || '').trim()
  return headerMap[t] || t
}

function buildCreateTable() {
  return `create table if not exists public.ep_data (
  id               text primary key,
  title            text not null,
  price_pc         numeric null,
  benefit_price    numeric null,
  normal_price     numeric null,
  link             text null,
  mobile_link      text null,
  image_link       text null,
  add_image_link   text null,
  video_url        text null,
  category_name1   text null,
  category_name2   text null,
  category_name3   text null,
  category_name4   text null,
  brand            text null,
  maker            text null,
  origin           text null,
  age_group        text null,
  gender           text null,
  city             text null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists ep_data_city_idx on public.ep_data (lower(city));
create index if not exists ep_data_updated_at_idx on public.ep_data (updated_at);
`}

function main() {
  const excelPath = findExcelPath()
  if (!excelPath) {
    console.error('엑셀 파일을 찾을 수 없습니다.')
    process.exit(1)
  }

  const wb = xlsxReadFile(excelPath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = xlsxUtils.sheet_to_json(sheet, { raw: false })
  if (!rows.length) {
    console.error('엑셀에 데이터가 없습니다.')
    process.exit(1)
  }

  const normalized = rows.map(row => {
    const out = {}
    for (const [k, v] of Object.entries(row)) {
      const nk = normalizeHeader(k)
      out[nk] = v
    }
    // 숫자 컬럼 캐스팅
    const numericFields = ['price_pc','benefit_price','normal_price','point','installation_costs','minimum_purchase_quantity','review_count']
    for (const nf of numericFields) {
      if (out[nf] != null && out[nf] !== '') {
        const n = Number(out[nf])
        out[nf] = Number.isFinite(n) ? n : null
      }
    }
    if (out['id'] != null) out['id'] = String(out['id'])
    return out
  }).filter(r => r['id'])

  const columns = [
    'id','title','price_pc','benefit_price','normal_price','link','mobile_link',
    'image_link','add_image_link','video_url','category_name1','category_name2',
    'category_name3','category_name4','naver_category','naver_product_id','condition','import_flag',
    'parallel_import','order_made','product_flag','adult','goods_type','barcode','manufacture_define_number',
    'brand','brand_certification','maker','origin','card_event','event_words','coupon','partner_coupon_download',
    'interest_free_event','point','installation_costs','search_tag','group_id','vendor_id','coordi_id',
    'minimum_purchase_quantity','review_count','shipping','attribute','option_detail','seller_id',
    'age_group','gender','city'
  ]

  const inserts = normalized.map(r => {
    const vals = columns.map(c => {
      const val = r[c]
      if (val === undefined || val === '') return 'NULL'
      if (['price_pc','benefit_price','normal_price','point','installation_costs','minimum_purchase_quantity','review_count'].includes(c)) {
        const n = Number(val)
        return Number.isFinite(n) ? String(n) : 'NULL'
      }
      return sqlEscape(val)
    }).join(', ')
    return `insert into public.ep_data (${columns.join(', ')}) values (${vals}) on conflict (id) do update set
  title = excluded.title,
  price_pc = excluded.price_pc,
  benefit_price = excluded.benefit_price,
  normal_price = excluded.normal_price,
  link = excluded.link,
  mobile_link = excluded.mobile_link,
  image_link = excluded.image_link,
  add_image_link = excluded.add_image_link,
  video_url = excluded.video_url,
  category_name1 = excluded.category_name1,
  category_name2 = excluded.category_name2,
  category_name3 = excluded.category_name3,
  category_name4 = excluded.category_name4,
  naver_category = excluded.naver_category,
  naver_product_id = excluded.naver_product_id,
  condition = excluded.condition,
  import_flag = excluded.import_flag,
  parallel_import = excluded.parallel_import,
  order_made = excluded.order_made,
  product_flag = excluded.product_flag,
  adult = excluded.adult,
  goods_type = excluded.goods_type,
  barcode = excluded.barcode,
  manufacture_define_number = excluded.manufacture_define_number,
  brand = excluded.brand,
  brand_certification = excluded.brand_certification,
  maker = excluded.maker,
  origin = excluded.origin,
  card_event = excluded.card_event,
  event_words = excluded.event_words,
  coupon = excluded.coupon,
  partner_coupon_download = excluded.partner_coupon_download,
  interest_free_event = excluded.interest_free_event,
  point = excluded.point,
  installation_costs = excluded.installation_costs,
  search_tag = excluded.search_tag,
  group_id = excluded.group_id,
  vendor_id = excluded.vendor_id,
  coordi_id = excluded.coordi_id,
  minimum_purchase_quantity = excluded.minimum_purchase_quantity,
  review_count = excluded.review_count,
  shipping = excluded.shipping,
  attribute = excluded.attribute,
  option_detail = excluded.option_detail,
  seller_id = excluded.seller_id,
  age_group = excluded.age_group,
  gender = excluded.gender,
  city = excluded.city,
  updated_at = now();`
  }).join('\n')

  const sql = `${buildCreateTable()}\n${inserts}\n`
  const outDir = path.join(process.cwd(), 'export')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'ep_data.sql')
  fs.writeFileSync(outPath, sql, 'utf8')
  console.log('SQL 생성 완료:', outPath)
}

main()


