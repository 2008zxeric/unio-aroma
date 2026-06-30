import re

with open('/Users/EricMac/.qclaw/workspace/src/admin/pages/InventoryManage.tsx', 'r') as f:
    content = f.read()

def find_block_end(content, start_pos):
    brace_count = 0
    found_start = False
    for i in range(start_pos, min(start_pos + 50000, len(content))):
        ch = content[i]
        if ch == '(':
            brace_count += 1
            found_start = True
        elif ch == ')':
            brace_count -= 1
            if found_start and brace_count == 0:
                j = i + 1
                while j < len(content) and content[j] in ' \t':
                    j += 1
                if j < len(content) and content[j] == '}':
                    return j + 1
    return -1

def replace_tab(content, comment_keyword, component_name, props_str):
    pattern = '/* ===================== ' + comment_keyword + ' ===================== */'
    idx = content.find(pattern)
    if idx < 0:
        print(f"WARNING: not found: {comment_keyword}")
        return content
    line_end = content.find('\n', idx)
    tab_start = content.find('{tab ===', line_end)
    if tab_start < 0:
        print(f"WARNING: no tab condition after {comment_keyword}")
        return content
    block_end = find_block_end(content, tab_start)
    if block_end < 0:
        print(f"WARNING: could not find block end for {comment_keyword}")
        return content
    
    replacement = (
        content[idx:tab_start]
        + '      <Suspense fallback={<TabLoader />}>\n'
        + f'        <{component_name}\n'
        + props_str
        + '\n        />\n'
        + '      </Suspense>'
    )
    result = content[:idx] + replacement + content[block_end:]
    print(f"  {comment_keyword}: {len(content)} -> {len(result)} chars ({len(content)-len(result)} saved)")
    return result

# Purchases tab
purchases_props = """          defaultHandler={defaultHandler}
          selectCls={selectCls}
          inputCls={inputCls}
          Perm={Perm as PermComponent}
          showPurchaseForm={showPurchaseForm}
          showImportCsv={showImportCsv}
          setShowPurchaseForm={setShowPurchaseForm}
          setShowImportCsv={setShowImportCsv}
          purchaseForm={purchaseForm}
          setPurchaseForm={setPurchaseForm}
          editingPurchase={editingPurchase}
          products={products}
          purSearchText={purSearchText}
          setPurSearchText={setPurSearchText}
          purFilterSeries={purFilterSeries}
          setPurFilterSeries={setPurFilterSeries}
          purFilterKeyword={purFilterKeyword}
          setPurFilterKeyword={setPurFilterKeyword}
          purFilterDateFrom={purFilterDateFrom}
          setPurFilterDateFrom={setPurFilterDateFrom}
          purFilterDateTo={purFilterDateTo}
          setPurFilterDateTo={setPurFilterDateTo}
          purFilterHandler={purFilterHandler}
          setPurFilterHandler={setPurFilterHandler}
          purFilterWarehouse={purFilterWarehouse}
          setPurFilterWarehouse={setPurFilterWarehouse}
          purSortField={purSortField}
          setPurSortField={setPurSortField}
          purSortDir={purSortDir}
          handlerOptions={handlerOptions}
          supplierOptions={supplierOptions}
          warehouseOptions={warehouseOptions}
          filteredPurchases={filteredPurchases}
          purchasesCount={purchases.length}
          productMetaMap={productMetaMap}
          csvData={csvData}
          clearCsvData={clearCsvData}
          csvImportDate={csvImportDate}
          setCsvImportDate={setCsvImportDate}
          csvImportHandler={csvImportHandler}
          setCsvImportHandler={setCsvImportHandler}
          csvImporting={csvImporting}
          exportCSV={exportCSV}
          resetPurFilters={resetPurFilters}
          cancelPurchaseForm={cancelPurchaseForm}
          handleAddPurchase={handleAddPurchase}
          startEditPurchase={startEditPurchase}
          handleDeletePurchase={handleDeletePurchase}
          handleCsvFileUpload={handleCsvFileUpload}
          downloadCsvTemplate={downloadCsvTemplate}
          handleCsvImport={handleCsvImport}
          cancelCsvImport={cancelCsvImport}"""
content = replace_tab(content, '进货记录 Tab', 'PurchasesTab', purchases_props)

# Sales tab
sales_props = """          defaultHandler={defaultHandler}
          selectCls={selectCls}
          inputCls={inputCls}
          Perm={Perm as PermComponent}
          showSaleForm={showSaleForm}
          showSaleCsv={showSaleCsv}
          setShowSaleForm={setShowSaleForm}
          setShowSaleCsv={setShowSaleCsv}
          saleForm={saleForm}
          setSaleForm={setSaleForm}
          editingSale={editingSale}
          products={products}
          salSearchText={salSearchText}
          setSalSearchText={setSalSearchText}
          salFilterSeries={salFilterSeries}
          setSalFilterSeries={setSalFilterSeries}
          salFilterKeyword={salFilterKeyword}
          setSalFilterKeyword={setSalFilterKeyword}
          salFilterDateFrom={salFilterDateFrom}
          setSalFilterDateFrom={setSalFilterDateFrom}
          salFilterDateTo={salFilterDateTo}
          setSalFilterDateTo={setSalFilterDateTo}
          salFilterHandler={salFilterHandler}
          setSalFilterHandler={setSalFilterHandler}
          salFilterWarehouse={salFilterWarehouse}
          setSalFilterWarehouse={setSalFilterWarehouse}
          salSortField={salSortField}
          setSalSortField={setSalSortField}
          salSortDir={salSortDir}
          handlerOptions={handlerOptions}
          warehouseOptions={warehouseOptions}
          filteredSales={filteredSales}
          salesCount={sales.length}
          summaries={summaries}
          productMetaMap={productMetaMap}
          saleCsvData={saleCsvData}
          clearSaleCsvData={clearSaleCsvData}
          saleCsvDate={saleCsvDate}
          setSaleCsvDate={setSaleCsvDate}
          saleCsvHandler={saleCsvHandler}
          setSaleCsvHandler={setSaleCsvHandler}
          saleCsvImporting={saleCsvImporting}
          exportCSV={exportCSV}
          resetSalFilters={resetSalFilters}
          cancelSaleForm={cancelSaleForm}
          handleAddSale={handleAddSale}
          startEditSale={startEditSale}
          handleDeleteSale={handleDeleteSale}
          handleSaleCsvFileUpload={handleSaleCsvFileUpload}
          downloadSaleCsvTemplate={downloadSaleCsvTemplate}
          handleCsvSaleImport={handleCsvSaleImport}
          cancelSaleCsv={cancelSaleCsv}"""
content = replace_tab(content, '销售记录 Tab', 'SalesTab', sales_props)

# Finance tab
finance_props = """          defaultHandler={defaultHandler}
          selectCls={selectCls}
          inputCls={inputCls}
          Perm={Perm as PermComponent}
          showFinanceForm={showFinanceForm}
          showFinanceCsv={showFinanceCsv}
          setShowFinanceForm={setShowFinanceForm}
          setShowFinanceCsv={setShowFinanceCsv}
          financeForm={financeForm}
          setFinanceForm={setFinanceForm}
          editingFinance={editingFinance}
          finFilterType={finFilterType}
          setFinFilterType={setFinFilterType}
          finFilterCategory={finFilterCategory}
          setFinFilterCategory={setFinFilterCategory}
          finFilterHandler={finFilterHandler}
          setFinFilterHandler={setFinFilterHandler}
          finFilterDateFrom={finFilterDateFrom}
          setFinFilterDateFrom={setFinFilterDateFrom}
          finFilterDateTo={finFilterDateTo}
          setFinFilterDateTo={setFinFilterDateTo}
          handlerOptions={handlerOptions}
          incomeOptions={incomeOptions}
          expenseOptions={expenseOptions}
          filteredFinanceRecords={filteredFinanceRecords}
          financeRecordsCount={financeRecords.length}
          totalOtherIncome={totalOtherIncome}
          totalOtherExpense={totalOtherExpense}
          financeCsvData={financeCsvData}
          clearFinanceCsvData={clearFinanceCsvData}
          financeCsvDate={financeCsvDate}
          setFinanceCsvDate={setFinanceCsvDate}
          financeCsvImporting={financeCsvImporting}
          exportFinanceCSV={exportFinanceCSV}
          cancelFinanceForm={cancelFinanceForm}
          handleAddFinance={handleAddFinance}
          startEditFinance={startEditFinance}
          handleDeleteFinance={handleDeleteFinance}
          handleFinanceCsvFileUpload={handleFinanceCsvFileUpload}
          downloadFinanceCsvTemplate={downloadFinanceCsvTemplate}
          handleCsvFinanceImport={handleCsvFinanceImport}"""
content = replace_tab(content, '其他收支 Tab', 'FinanceTab', finance_props)

# Reimburse tab
reimburse_props = """          selectCls={selectCls}
          inputCls={inputCls}
          Perm={Perm as PermComponent}
          allReimburseItems={allReimburseItems}
          filteredReimburseItems={filteredReimburseItems}
          reimburseTotals={reimburseTotals}
          reimbFilterStatus={reimbFilterStatus}
          setReimbFilterStatus={setReimbFilterStatus}
          reimbFilterHandler={reimbFilterHandler}
          setReimbFilterHandler={setReimbFilterHandler}
          reimbFilterCode={reimbFilterCode}
          setReimbFilterCode={setReimbFilterCode}
          checkedReimbIds={checkedReimbIds}
          batchReimbDate={batchReimbDate}
          setBatchReimbDate={setBatchReimbDate}
          uploadingAttachment={uploadingAttachment}
          handlerOptions={handlerOptions}
          selectAllPending={selectAllPending}
          batchReimburse={batchReimburse}
          generateMissingCodes={generateMissingCodes}
          toggleCheckReimburse={toggleCheckReimburse}
          toggleReimburse={toggleReimburse}
          jumpToSource={jumpToSource}
          handleAttachmentUpload={handleAttachmentUpload}
          handleRemoveAttachment={handleRemoveAttachment}"""
content = replace_tab(content, '报销管理 Tab', 'ReimburseTab', reimburse_props)

# Logs tab
logs_props = """          auditLogs={auditLogs}
          logsLoading={loading}
          onRefresh={() => loadTabData('logs', true)}"""
content = replace_tab(content, '操作日志 Tab', 'LogsTab', logs_props)

with open('/Users/EricMac/.qclaw/workspace/src/admin/pages/InventoryManage.tsx', 'w') as f:
    f.write(content)

print(f"\nFinal lines: {len(content.split(chr(10)))}")
