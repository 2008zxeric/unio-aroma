#!/usr/bin/env python3
"""Fix two products with wrong IDs in yuan series"""
import urllib.request, json

SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng"

descriptions = {
    "78ce1894-9e35-4e19-83c8-3c46f891d26c": """【植物档案】唇形科百里香属，拉丁学名 Thymus vulgaris CT Thymol。开花全株水蒸气蒸馏，精油淡黄至红褐色，香气强劲辛香草药调。

【化学组成】百里酚（40-55%）、对伞花烃（15-25%）、γ-松油烯（5-10%）、微量香芹酚、沉香醇。百里酚型是百里香精油中抗菌力最强的化学型。

【主要功效】百里酚具有强大的抗菌、抗病毒、抗真菌和免疫刺激作用，是天然抗菌剂中的佼佼者。对伞花烃和γ-松油烯为百里酚的前驱物。对呼吸道感染、疲劳恢复和免疫低下有积极帮助。

【应用建议】扩香：1滴净化空气。按摩：0.5-1%高稀释局部使用。适合与柠檬、茶树、尤加利、薰衣草搭配。

【注意事项】百里酚刺激性强，高浓度务必避开黏膜。敏感肌肤和婴幼儿禁用。孕妇慎用。血压异常者慎用。""",

    "ce98abb5-9c9b-4911-89f8-166557025c6d": """【植物档案】唇形科薄荷属，拉丁学名 Mentha piperita L.（有机认证）。全草水蒸气蒸馏，精油无色至淡黄，香气清凉强烈。

【化学组成】薄荷醇（38-48%）、薄荷酮（15-25%）、1,8-桉叶油醇（3-8%）、微量乙酸薄荷酯、柠檬烯。

【主要功效】与经典胡椒薄荷精油一致：缓解头痛、改善消化、提神醒脑。有机认证确保种植过程无化学农药和化肥，适合对农药残留有顾虑的用户。

【应用建议】扩香：1-2滴提神。外用：1%稀释，头痛时涂抹太阳穴。适合与柠檬、迷迭香、尤加利搭配。

【注意事项】婴幼儿禁用，高浓度刺激皮肤，避免接触眼部黏膜。"""
}

def upload(pid, desc):
    url = f"https://xuicjydgtoltdhkbqoju.supabase.co/rest/v1/products?id=eq.{pid}"
    data = json.dumps({"detail_intro": desc}).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='PATCH')
    req.add_header('apikey', SUPABASE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'resolution=merge-duplicates')
    proxy_handler = urllib.request.ProxyHandler({})
    opener = urllib.request.build_opener(proxy_handler)
    try:
        with opener.open(req, timeout=15) as resp:
            print(f"  ✅ {pid[:8]}... HTTP {resp.status}")
    except Exception as e:
        print(f"  ❌ {pid[:8]}... {str(e)[:80]}")

print("补传2个产品：")
for pid, desc in descriptions.items():
    upload(pid, desc)
print("完成！")
