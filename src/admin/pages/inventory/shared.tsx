import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface SortableThProps {
  field: string;
  currentField: string;
  currentDir: 'asc' | 'desc';
  onSort: (field: string) => void;
  children: React.ReactNode;
}

const SortableTh: React.FC<SortableThProps> = React.memo(({
  field,
  currentField,
  currentDir,
  onSort,
  children,
}) => (
  <th
    className={`text-${field === 'date' ? 'left' : 'right'} px-4 py-2.5 text-xs text-[#8AA08A] cursor-pointer select-none hover:text-[#4A7C59] transition-colors`}
    onClick={() => {
      if (currentField === field) {
        onSort(currentDir === 'asc' ? 'desc' : 'asc');
      } else {
        onSort('desc');
      }
    }}
  >
    <span className="inline-flex items-center gap-1">
      {children}
      {currentField === field && (
        currentDir === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />
      )}
      {currentField !== field && <ArrowUpDown size={11} className="opacity-30" />}
    </span>
  </th>
));

SortableTh.displayName = 'SortableTh';

export default SortableTh;
