import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({
  label = 'Language',
  showLabel = true,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  onChange
}) {
  const { language, setLanguage, languages } = useLanguage();

  const handleChange = (event) => {
    const value = event.target.value;
    setLanguage(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${containerClassName}`.trim()}>
      {showLabel && (
        <span className={`text-[10px] font-bold uppercase tracking-wide ${labelClassName}`.trim()}>
          {label}
        </span>
      )}
      <select
        aria-label={label}
        value={language}
        onChange={handleChange}
        className={`h-8 rounded-lg border border-slate-200 bg-white/90 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary ${selectClassName}`.trim()}
      >
        {languages.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
