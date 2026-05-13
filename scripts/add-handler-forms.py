import re

filepath = '/Users/EricMac/.qclaw/workspace/src/admin/pages/InventoryManage.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Purchase form: insert handler after supplier_code closing div
old = '''<div><label className="block text-xs text-[#6B856B] mb-1.5">供货商代码</label><input placeholder="例如: SUP001" value={purchaseForm.supplier_code} onChange={e => setPurchaseForm(f => ({ ...f, supplier_code: e.target.value }))} className={inputCls} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelPurchaseForm}'''

new = '''<div><label className="block text-xs text-[#6B856B] mb-1.5">供货商代码</label><input placeholder="例如: SUP001" value={purchaseForm.supplier_code} onChange={e => setPurchaseForm(f => ({ ...f, supplier_code: e.target.value }))} className={inputCls} /></div>
                </div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
                  <select value={purchaseForm.handler} onChange={e => setPurchaseForm(f => ({ ...f, handler: e.target.value }))} className={selectCls}>
                    <option value="">请选择</option>
                    {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelPurchaseForm}'''

count = content.count(old)
print(f"Purchase handler: {count} match(es)")

if count == 1:
    content = content.replace(old, new, 1)
    
    # Sale form: insert handler after sale amount
    old2 = '''<div><label className="block text-xs text-[#6B856B] mb-1.5">销售金额(¥) *</label><input type="number" step="0.01" value={saleForm.total_amount} onChange={e => setSaleForm(f => ({ ...f, total_amount: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelSaleForm}'''
    
    new2 = '''<div><label className="block text-xs text-[#6B856B] mb-1.5">销售金额(¥) *</label><input type="number" step="0.01" value={saleForm.total_amount} onChange={e => setSaleForm(f => ({ ...f, total_amount: e.target.value }))} className={inputCls} /></div>
                </div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
                  <select value={saleForm.handler} onChange={e => setSaleForm(f => ({ ...f, handler: e.target.value }))} className={selectCls}>
                    <option value="">请选择</option>
                    {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelSaleForm}'''
    
    count2 = content.count(old2)
    print(f"Sale handler: {count2} match(es)")
    if count2 == 1:
        content = content.replace(old2, new2, 1)
        with open(filepath, 'w') as f:
            f.write(content)
        print("Both handlers inserted successfully!")
    else:
        print(f"Sale match count is {count2}, not 1")
else:
    print(f"Purchase match count is {count}, not 1")
