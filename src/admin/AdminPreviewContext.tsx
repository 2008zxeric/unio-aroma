/**
 * 后台全局上下文：记录当前编辑状态，用于"预览前台"按钮生成正确链接
 * 用法：ProductList/CountryList 写入，AdminLayout 读取
 */

import React, { createContext, useContext, useState } from 'react';

interface AdminPreviewContextType {
  previewUrl: string | null; // 当前编辑项的前台链接，null=无编辑中
  setPreviewUrl: (url: string | null) => void;
}

const AdminPreviewContext = createContext<AdminPreviewContextType>({
  previewUrl: null,
  setPreviewUrl: () => {},
});

export function AdminPreviewProvider({ children }: { children: React.ReactNode }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <AdminPreviewContext.Provider value={{ previewUrl, setPreviewUrl }}>
      {children}
    </AdminPreviewContext.Provider>
  );
}

export function useAdminPreview() {
  return useContext(AdminPreviewContext);
}