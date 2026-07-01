/**
 * ComboBoxInput — 下拉选择 + 自由输入的组合框
 * 
 * 使用场景：经手人等字段——默认当前用户，可从已有列表中选择，也可自由输入新值。
 * 键盘操作：↑↓ 导航选项，Enter 选中，Escape 关闭列表。
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboBoxInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  defaultHighlight?: string; // 打开时默认高亮的选项 value
}

const ComboBoxInput: React.FC<ComboBoxInputProps> = ({
  value,
  onChange,
  options,
  placeholder = '请选择或输入',
  className = '',
  defaultHighlight,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 同步外部 value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // 过滤选项
  const filteredOptions = inputValue
    ? options.filter(o =>
        o.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        o.value.toLowerCase().includes(inputValue.toLowerCase())
      )
    : options;

  // 打开时默认高亮匹配项
  useEffect(() => {
    if (isOpen && defaultHighlight) {
      const idx = filteredOptions.findIndex(o => o.value === defaultHighlight);
      setHighlightIndex(idx >= 0 ? idx : -1);
    } else if (isOpen) {
      setHighlightIndex(-1);
    }
  }, [isOpen, defaultHighlight, filteredOptions.length]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 选中高亮项滚动到可见
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const selectOption = useCallback((optValue: string) => {
    setInputValue(optValue);
    onChange(optValue);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(i => (i < filteredOptions.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(i => (i > 0 ? i - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
          selectOption(filteredOptions[highlightIndex].value);
        } else {
          // 如果没有高亮项，提交当前输入
          onChange(inputValue);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // 格式化显示已选项（显示 label，而非 value 代码）
  const displayValue = (() => {
    const matched = options.find(o => o.value === inputValue);
    return matched ? matched.label : inputValue;
  })();

  return (
    <div ref={containerRef} className="relative">
      {/* 输入框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? inputValue : displayValue}
          onChange={e => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
            // 如果删到空，清空值
            if (!e.target.value) onChange('');
          }}
          onFocus={() => { setIsOpen(true); setInputValue(value || ''); }}
          onBlur={() => {
            // 延迟关闭，让点击事件先触发
            setTimeout(() => {
              setIsOpen(false);
              // blur 时提交当前值
              if (inputValue && inputValue !== value) {
                onChange(inputValue);
              }
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${className} pr-8`}
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setInputValue(value || '');
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9AAA9A] hover:text-[#5C725C] p-0.5"
        >
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 下拉列表 */}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-white border border-[#D5E2D5] rounded-lg shadow-lg z-50"
        >
          {filteredOptions.map((opt, idx) => (
            <li
              key={opt.value}
              onClick={() => selectOption(opt.value)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                idx === highlightIndex
                  ? 'bg-[#EEF4EF] text-[#1A2E1A]'
                  : 'text-[#5C725C] hover:bg-[#F8FAF8]'
              }`}
            >
              {opt.label}
              {opt.label !== opt.value && (
                <span className="text-[10px] text-[#9AAA9A] ml-2">({opt.value})</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 无匹配时提示可自定义输入 */}
      {isOpen && inputValue && filteredOptions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5E2D5] rounded-lg shadow-lg z-50 px-3 py-3 text-xs text-[#9AAA9A] text-center">
          输入新值「{inputValue}」，按 Enter 确认
        </div>
      )}
    </div>
  );
};

export default ComboBoxInput;
