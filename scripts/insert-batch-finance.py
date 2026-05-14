#!/usr/bin/env python3
"""Insert batch purchase, batch sale, finance tab, and total profit into InventoryManage.tsx."""
import re

filepath = '/Users/EricMac/.qclaw/workspace/src/admin/pages/InventoryManage.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# ===== 1. Insert batch/finance handlers BEFORE the "cancelSaleForm" functions =====
# Find the line right after cancelSaleForm function, before "通用 select/input 样式"
handler_insert_marker = '  const cancelSaleForm = () => {'
handler_insert_pos = content.find(handler_insert_marker)
# Find where this function ends (the next const/comment block)
end_of_cancel = content.find('  // 通用 select/input 样式', handler_insert_pos)

batch_handlers_code = '''  };

  // ---- 批量入库 ----
  const toggleBatchPurchaseItem = (productId: string) => {
    setBatchPurchaseItems(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleBatchPurchase = async () => {
    if (batchPurchaseItems.length === 0 || !bpUnitCost) {
      alert('请选择至少一个产品并填写单价！'); return;
    }
    const costPerMl = parseFloat(bpUnitCost);
    if (isNaN(costPerMl) || costPerMl <= 0) { alert('请输入有效的单价！'); return; }
    const shipping = parseFloat(bpShippingFee) || 0;
    const totalMlSum = batchPurchaseItems.reduce((s, pid) => {
      const p = products.find(pr => pr.id === pid);
      return s + 1; // 每个产品1笔，运费按产品数均分
    }, 0);
    const shippingPerProduct = totalMlSum > 0 ? shipping / totalMlSum : 0;

    try {
      for (const pid of batchPurchaseItems) {
        const p = products.find(pr => pr.id === pid);
        if (!p) continue;
        await purchaseService.create({
          product_id: pid,
          purchase_date: bpDate,
          volume_ml: 1,
          unit_cost: costPerMl,
          total_cost: costPerMl + shippingPerProduct,
          handler: bpHandler || null,
        });
      }
      setBatchPurchaseItems([]);
      setShowBatchPurchase(false);
      setBpUnitCost('');
      setBpShippingFee('0');
      setBpHandler('');
      await loadAllData();
    } catch (err: any) { alert('批量入库失败：' + err.message); }
  };

  const cancelBatchPurchase = () => {
    setShowBatchPurchase(false);
    setBatchPurchaseItems([]);
    setBpUnitCost('');
    setBpShippingFee('0');
    setBpHandler('');
  };

  // ---- 批量出库 ----
  const toggleBatchSaleItem = (productId: string) => {
    setBatchSaleItems(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleBatchSale = async () => {
    if (batchSaleItems.length === 0 || !bsUnitPrice) {
      alert('请选择至少一个产品并填写单价！'); return;
    }
    const price = parseFloat(bsUnitPrice);
    if (isNaN(price) || price <= 0) { alert('请输入有效的单价！'); return; }

    try {
      for (const pid of batchSaleItems) {
        const p = products.find(pr => pr.id === pid);
        if (!p) continue;
        await salesService.create({
          product_id: pid,
          sale_date: bsDate,
          volume_ml: 1,
          sale_price: price,
          total_amount: price,
          handler: bsHandler || null,
        });
      }
      setBatchSaleItems([]);
      setShowBatchSale(false);
      setBsUnitPrice('');
      setBsHandler('');
      await loadAllData();
    } catch (err: any) { alert('批量出库失败：' + err.message); }
  };

  const cancelBatchSale = () => {
    setShowBatchSale(false);
    setBatchSaleItems([]);
    setBsUnitPrice('');
    setBsHandler('');
  };

  // ---- 其他收支操作 ----
  const handleAddFinance = async () => {
    if (!financeForm.category || !financeForm.amount) {
      alert('请填写完整信息！'); return;
    }
    try {
      if (editingFinance) {
        await financeRecordService.update(editingFinance.id, {
          ...financeForm,
          amount: parseFloat(financeForm.amount),
        });
        setEditingFinance(null);
      } else {
        await financeRecordService.create({
          ...financeForm,
          amount: parseFloat(financeForm.amount),
        });
      }
      setFinanceForm({ record_date: new Date().toISOString().split('T')[0], record_type: 'other_income', category: '', amount: '', notes: '', handler: '' });
      setShowFinanceForm(false);
      await loadAllData();
    } catch (err: any) { alert(editingFinance ? '修改失败：' + err.message : '添加失败：' + err.message); }
  };

  const startEditFinance = (f: FinanceRecord) => {
    setEditingFinance(f);
    setFinanceForm({
      record_date: f.record_date,
      record_type: f.record_type,
      category: f.category,
      amount: String(f.amount),
      notes: f.notes || '',
      handler: f.handler || '',
    });
    setShowFinanceForm(true);
  };

  const handleDeleteFinance = async (id: string) => {
    if (!confirm('确认删除此收支记录？')) return;
    try {
      await financeRecordService.delete(id);
      await loadAllData();
    } catch (err: any) { alert('删除失败：' + err.message); }
  };

  const cancelFinanceForm = () => {
    setShowFinanceForm(false);
    setEditingFinance(null);
    setFinanceForm({ record_date: new Date().toISOString().split('T')[0], record_type: 'other_income', category: '', amount: '', notes: '', handler: '' });
  };

'''

content = content[:end_of_cancel] + batch_handlers_code + content[end_of_cancel:]

with open(filepath, 'w') as f:
    f.write(content)

print("Batch/finance handlers inserted. Checking tab state type...")
print("File rewritten successfully.")
