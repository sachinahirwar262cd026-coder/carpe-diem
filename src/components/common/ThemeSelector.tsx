import React, { useState } from 'react';
import { Palette, Sun, Moon, Sparkles, Check, TreePine, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppTheme } from '../../types';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions: {
    id: AppTheme;
    name: string;
    description: string;
    icon: any;
    previewColors: string[];
  }[] = [
    {
      id: 'clean-light',
      name: 'Clean Light Eco (Default)',
      description: 'Crisp pearl white & slate-900 high clarity presentation theme',
      icon: Sun,
      previewColors: ['#f8fafc', '#059669', '#2563eb'],
    },
    {
      id: 'dark-slate',
      name: 'Dark Eco Slate',
      description: 'Deep midnight slate with radiant teal & emerald accents',
      icon: Moon,
      previewColors: ['#0f172a', '#14b8a6', '#06b6d4'],
    },
    {
      id: 'deep-forest',
      name: 'Deep Forest Emerald',
      description: 'Rich dark pine and high-saturation bio-green environmental palette',
      icon: TreePine,
      previewColors: ['#022c22', '#10b981', '#34d399'],
    },
    {
      id: 'cyber-neon',
      name: 'Cyber Neon Matrix',
      description: 'High-tech sci-fi black with glowing neon cyan & purple lasers',
      icon: Zap,
      previewColors: ['#030712', '#00f0ff', '#a855f7'],
    },
  ];

  const currentThemeObj = themeOptions.find((t) => t.id === theme) || themeOptions[0];
  const CurrentIcon = currentThemeObj.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition text-xs font-semibold shadow-sm"
        title="Switch Environmental Theme"
      >
        <Palette className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline">{currentThemeObj.name}</span>
        <div className="flex items-center space-x-1 ml-1">
          {currentThemeObj.previewColors.map((col, idx) => (
            <span
              key={idx}
              className="w-2 h-2 rounded-full border border-slate-600"
              style={{ backgroundColor: col }}
            />
          ))}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Environmental Themes
              </span>
              <span className="text-[10px] text-teal-400 font-mono">SIH 2026</span>
            </div>

            <div className="space-y-1">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-500/15 text-white border border-teal-500/40'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          isSelected
                            ? 'bg-teal-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center space-x-1.5">
                          <span>{opt.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5 max-w-[150px]">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5">
                      <div className="flex items-center space-x-1">
                        {opt.previewColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full border border-slate-700 shadow-xs"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
