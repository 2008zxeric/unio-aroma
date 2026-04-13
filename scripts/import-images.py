#!/usr/bin/env python3
"""批量导入图片URL到Supabase - 使用REST API"""
import json, urllib.request, os, glob, re

SUPABASE_URL = "https://xuicjydgtoltdhkbqoju.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng"
GITHUB_RAW = "https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets"
ASSETS_DIR = "/Users/EricMac/WorkBuddy/20260407110132/unio-aroma-site/assets"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def api_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def api_patch(table, id_val, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id_val}",
        data=body, headers=HEADERS, method="PATCH"
    )
    with urllib.request.urlopen(req) as r:
        return r.status

def find_files(folder):
    pattern = os.path.join(ASSETS_DIR, folder, "*.webp")
    files = glob.glob(pattern)
    return [os.path.basename(f) for f in files]

def match_score(name_en, filename):
    """计算文件名与产品英文名的匹配度"""
    fname = filename.lower().replace(".webp", "").strip()
    name = name_en.lower().strip()
    if fname == name:
        return 100
    # 去掉空格比较
    if fname.replace(" ", "") == name.replace(" ", ""):
        return 95
    # 关键词匹配
    words = [w for w in name.split() if len(w) > 2]
    matched = sum(1 for w in words if w in fname)
    return matched * 20

# ===== 产品图片 =====
print("=== 产品图片导入 ===")

CATEGORY_FOLDERS = {
    "jin": "metal", "mu": "wood", "shui": "water", "huo": "fire", "tu": "earth",
    "body": "body", "mind": "heart", "soul": "soul",
    "clear": "place", "nourish": "place", "soothe": "place", "aesthetic": "place",
    "meditation": "Meditation",
}

products = api_get("products?select=id,name_en,code,category,series_code,image_url&is_active=eq.true")
print(f"共 {len(products)} 个产品\n")

# 预加载所有文件夹的文件
folder_files = {}
for cat, folder in CATEGORY_FOLDERS.items():
    folder_files[cat] = find_files(folder)

# 预定义已知映射（文件名和name_en不完全一致的）
KNOWN_MAP = {
    # body文件夹
    "HE-moonlight-oil": "Moonlight Oil.webp",
    "HE-frost-mint": "Frost Mint.webp",
    "HE-trace-balm": "Trace Balm.webp",
    "HE-cloud-velvet": "cloud velvet.webp",
    "HE-dawn-glow": "Dawn Glow.webp",
    # soul文件夹 - 只有 "1" 文件夹无文件
    # heart文件夹 - 同上
    # clear/nourish/soothe -> place文件夹 (无直接匹配)
    # meditation
    "JG-incense-sticks": "Incense Sticks.webp",
    "JG-rollerball": "Rollerball.webp",
    "JG-gypsum": "Gypsum.webp",
    "JG-mountain": "mountain.webp",
    "JG-glass": "glass.webp",
    # aesthetic
    "JG-crackled": "Crackled.webp",
    "JG-necklace": "Necklace .webp",
    "JG-walnut": "Walnut.webp",
    "JG-candle": "candle.webp",
    "JG-vessel": "Vessel.webp",
    # metal
    "FR-sacred-frankincense": "Sacred Frankincense.webp",
    "AU-eucalyptus-glaciale": " Eucalyptus Glaciale.webp",
    "AU-tea-tree-antiseptic": "Tea Tree Antiseptic.webp",
    "AL-peppermint-from-peaks": "Peppermint from Peaks.webp",
    "FR-citronella-clarissima": "Citronella Clarissima.webp",
    # wood
    "IN-aged-sandalwood": "Aged Sandalwood.webp",
    "FR-misty-cypress": "Misty Cypress.webp",
    "NP-himalayan-cedar": "Himalayan Cedar.webp",
    "RU-boreal-pine": "Boreal Pine.webp",
    "BR-sacred-rosewood-isle": "Sacred Rosewood Isle.webp",
    # water
    "SO-myrrh-secreta": "Myrrh Secreta.webp",
    "IN-deep-root-vetiver": "Deep Root Vetiver.webp",
    "ID-patchouli-nocturne": "Patchouli Nocturne.webp",
    "SC-juniper-by-the-loch": "Juniper by the Loch.webp",
    "SI-benzoin-ambrosia": "Benzoin Ambrosia.webp",
    # fire
    "BG-damask-rose-aureate": "Damask Rose Aureate.webp",
    "MG-ylang-equatorial": "Ylang Equatorial.webp",
    "IN-jasminum-grandiflorum": "Jasminum Grandiflorum.webp",
    "TN-neroli-soleil": "Neroli Soleil.webp",
    "CN-geranium-rose": "Geranium Rosé.webp",
    # earth
    "IT-bergamot-alba": "Bergamot Alba.webp",
    "CN-zingiber-terrae": "Zingiber Terrae.webp",
    "CN-mandarin-jucunda": "Mandarin Jucunda.webp",
    "US-grapefruit-pomona": "Grapefruit Pomona.webp",
    "EU-oakmoss-taiga": "Oakmoss Taiga.webp",
}

p_updated = 0
p_notfound = []

for p in products:
    if p["image_url"]:
        continue
    
    matched_file = None
    folder = CATEGORY_FOLDERS.get(p["category"])
    
    # 先查已知映射
    if p["code"] in KNOWN_MAP:
        matched_file = KNOWN_MAP[p["code"]]
        # 验证文件存在
        all_files = folder_files.get(p["category"], [])
        if matched_file not in all_files:
            matched_file = None  # 文件不存在，用备选方案
    
    if not matched_file and folder:
        files = folder_files.get(p["category"], [])
        best_score = 0
        for f in files:
            score = match_score(p["name_en"], f)
            if score > best_score:
                best_score = score
                matched_file = f
        if best_score < 40:
            matched_file = None
    
    if matched_file and folder:
        # URL encode the filename
        from urllib.parse import quote
        url = f"{GITHUB_RAW}/products/{folder}/{quote(matched_file)}"
        status = api_patch("products", p["id"], {"image_url": url})
        if status == 204:
            print(f"  ✅ {p['name_en']} → {matched_file}")
            p_updated += 1
        else:
            print(f"  ❌ {p['name_en']} → 更新失败({status})")
    else:
        p_notfound.append(f"{p['name_en']} ({p['category']}/{p['code']})")

print(f"\n产品图片: {p_updated} 个已更新")
if p_notfound:
    print(f"未匹配 ({len(p_notfound)}):")
    for n in p_notfound:
        print(f"  ⚠️ {n}")

# ===== 国家图片 =====
print("\n=== 国家/省份图片导入 ===")

dest_files = find_files("destinations")
prov_files = find_files("province")

# 省份拼音映射
PROVINCE_PINYIN = {
    "anhui": "anhui", "beijing": "beijing", "chongqing": "chongqing",
    "fujian": "fujian", "gansu": "gansu", "guangdong": "guangdong",
    "guangxi": "guangxi", "guizhou": "guizhou", "hainan": "hainan",
    "hebei": "hebei", "henan": "henan", "hubei": "hubei", "hunan": "hunan",
    "jiangsu": "jiangsu", "jiangxi": "jiangxi", "neimenggu": "neimenggu",
    "ningxia": "ningxia", "qinghai": "qinghai", "shandong": "shandong",
    "shanghai": "shanghai", "shannxi": "shannxi", "shanxi": "shanxi",
    "sichuan": "sichuan", "taiwan": "taiwan", "tianjin": "tianjin",
    "xinjiang": "xinjiang", "xizang": "xizang", "yunnan": "yunnan",
    "zhejiang": "zhejiang",
}

countries = api_get("countries?select=id,name_cn,name_en,region,image_url")
print(f"共 {len(countries)} 个国家/地区\n")

# 预定义国家英文名到文件名映射（大小写/空格差异）
COUNTRY_FILE_MAP = {}
for f in dest_files:
    base = f.lower().replace(".webp", "").replace(" ", "")
    COUNTRY_FILE_MAP[base] = f

c_updated = 0
c_notfound = []

for c in countries:
    if c["image_url"]:
        continue
    
    url = None
    
    if c["region"] == "神州":
        # 省份: 用name_en匹配pinyin
        pinyin = c.get("name_en", "").lower().replace(" ", "")
        if pinyin in PROVINCE_PINYIN:
            matched = prov_files.find(f => f.lower().replace(".webp","") === PROVINCE_PINYIN[pinyin])
            # Python version:
            matched = None
            for pf in prov_files:
                if pf.lower().replace(".webp","") == PROVINCE_PINYIN[pinyin]:
                    matched = pf
                    break
            if matched:
                from urllib.parse import quote
                url = f"{GITHUB_RAW}/province/{quote(matched)}"
    else:
        # 全球国家
        name_base = (c.get("name_en") or "").lower().replace(" ", "")
        matched = COUNTRY_FILE_MAP.get(name_base)
        if not matched:
            # 尝试模糊匹配
            for key, f in COUNTRY_FILE_MAP.items():
                if key in name_base or name_base in key:
                    matched = f
                    break
        if matched:
            from urllib.parse import quote
            url = f"{GITHUB_RAW}/destinations/{quote(matched)}"
    
    if url:
        status = api_patch("countries", c["id"], {"image_url": url})
        if status == 204:
            print(f"  ✅ {c['name_cn']} ({c['region']})")
            c_updated += 1
        else:
            print(f"  ❌ {c['name_cn']} → 更新失败({status})")
    else:
        c_notfound.append(f"{c['name_cn']} ({c.get('name_en','')}, {c['region']})")

print(f"\n国家图片: {c_updated} 个已更新")
if c_notfound:
    print(f"未匹配 ({len(c_notfound)}):")
    for n in c_notfound:
        print(f"  ⚠️ {n}")

print("\n=== 全部完成 ===")
