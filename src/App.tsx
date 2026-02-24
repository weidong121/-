/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Copy, 
  Heart, 
  History as HistoryIcon, 
  Trash2, 
  Check, 
  ChevronRight,
  User,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateHighEQSpeech, type SpeechResult } from './services/geminiService';
import type { FavoriteItem, HistoryItem } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'me'>('home');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SpeechResult[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('正在熄火中...');

  const loadingMessages = [
    '正在熄火中...',
    '正在翻译牛马语...',
    '正在去除攻击性...',
    '正在注入高情商...',
    '正在体面化处理...',
    '正在安抚暴躁灵魂...',
    '正在寻找职场生机...',
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('niuma_favorites');
    const savedHistory = localStorage.getItem('niuma_history');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('niuma_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('niuma_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    try {
      const generated = await generateHighEQSpeech(input);
      setResults(generated);
      
      // Add to history
      const newHistoryItems: HistoryItem[] = generated.map(res => ({
        id: Math.random().toString(36).substr(2, 9),
        original: input,
        style: res.style,
        content: res.content,
        scene: res.scene,
        timestamp: Date.now()
      }));
      
      setHistory(prev => [...newHistoryItems, ...prev].slice(0, 50));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const toggleFavorite = (item: SpeechResult | HistoryItem) => {
    const content = 'content' in item ? item.content : (item as any).content;
    const isFav = favorites.some(f => f.content === content);
    
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.content !== content));
    } else {
      const newFav: FavoriteItem = {
        id: Math.random().toString(36).substr(2, 9),
        original: 'original' in item ? (item as any).original : input,
        style: item.style,
        content: content,
        scene: item.scene,
        timestamp: Date.now()
      };
      setFavorites(prev => [newFav, ...prev]);
    }
  };

  const clearHistory = () => {
    if (confirm('确定清空所有历史记录吗？')) {
      setHistory([]);
    }
  };

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      <header className="flex items-center gap-2 pt-4">
        <div className="bg-niuma-yellow p-2 rounded-lg">
          <Flame className="text-niuma-dark" size={24} />
        </div>
        <h1 className="text-2xl font-black tracking-tighter">牛马高情商发言 <span className="text-niuma-yellow">NIU MA</span></h1>
      </header>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你想吐槽/发火/骂人的话，一键生成体面发言..."
            className="niuma-input min-h-[160px] resize-none text-lg"
            maxLength={500}
          />
          <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
            {input.length}/500
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!input.trim() || loading}
          className="niuma-button w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              <span>{loadingMessage}</span>
            </>
          ) : (
            <>
              <Zap size={20} />
              <span>一键体面</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">生成结果</h2>
              <button onClick={() => setResults([])} className="text-xs text-zinc-500 hover:text-white">清空</button>
            </div>
            
            {results.map((res, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-niuma-yellow/10 text-niuma-yellow text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {res.style}
                    </span>
                    <span className="text-zinc-500 text-[10px]">{res.scene}</span>
                  </div>
                </div>
                
                {editingId === `edit-${idx}` ? (
                  <textarea
                    autoFocus
                    className="w-full bg-white/5 border border-niuma-yellow/30 rounded-lg p-2 text-sm text-white focus:outline-none"
                    value={res.content}
                    onChange={(e) => {
                      const newResults = [...results];
                      newResults[idx].content = e.target.value;
                      setResults(newResults);
                    }}
                    onBlur={() => setEditingId(null)}
                  />
                ) : (
                  <p className="text-lg leading-relaxed font-medium">{res.content}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-zinc-500 hover:text-niuma-yellow transition-colors">
                      <motion.div whileTap={{ scale: 1.2 }}>👍</motion.div>
                    </button>
                    <button className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                      <motion.div whileTap={{ scale: 1.2 }}>👎</motion.div>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingId(editingId === `edit-${idx}` ? null : `edit-${idx}`)}
                      className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <RefreshCw size={16} className={cn(editingId === `edit-${idx}` && "text-niuma-yellow")} />
                    </button>
                    <button 
                      onClick={() => toggleFavorite(res)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        favorites.some(f => f.content === res.content) ? "text-red-500 bg-red-500/10" : "text-zinc-500 hover:bg-white/5"
                      )}
                    >
                      <Heart size={18} fill={favorites.some(f => f.content === res.content) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => handleCopy(res.content, `res-${idx}`)}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                      {copyStatus === `res-${idx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      <span>{copyStatus === `res-${idx}` ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderMe = () => (
    <div className="space-y-6 pb-24">
      <header className="pt-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-niuma-yellow flex items-center justify-center text-3xl">
          🐂
        </div>
        <div>
          <h1 className="text-xl font-black">高级搬砖工</h1>
          <p className="text-zinc-500 text-sm">已成功熄火 {history.length} 次</p>
        </div>
      </header>

      <div className="flex gap-3">
        <button className="flex-1 glass-card p-4 rounded-2xl text-center space-y-1">
          <div className="text-xl font-black text-niuma-yellow">{favorites.length}</div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold">我的收藏</div>
        </button>
        <button className="flex-1 glass-card p-4 rounded-2xl text-center space-y-1">
          <div className="text-xl font-black text-niuma-yellow">{history.length}</div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold">转换历史</div>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">最近收藏</h2>
          <ChevronRight size={16} className="text-zinc-600" />
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">暂无收藏</div>
        ) : (
          <div className="space-y-3">
            {favorites.slice(0, 3).map((fav) => (
              <div key={fav.id} className="glass-card p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-niuma-yellow uppercase">{fav.style}</span>
                  <button onClick={() => toggleFavorite(fav)} className="text-red-500">
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
                <p className="text-sm">{fav.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">历史记录</h2>
          <button onClick={clearHistory} className="text-zinc-600 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">暂无记录</div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 truncate mb-1">原话: {h.original}</p>
                  <p className="text-sm font-medium truncate">{h.content}</p>
                </div>
                <button 
                  onClick={() => handleCopy(h.content, h.id)}
                  className="p-2 bg-white/5 rounded-lg text-zinc-500 shrink-0"
                >
                  {copyStatus === h.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-niuma-dark text-white font-sans selection:bg-niuma-yellow selection:text-niuma-dark">
      <div className="px-6 pt-2">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'me' && renderMe()}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-niuma-dark/80 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'home' ? "text-niuma-yellow" : "text-zinc-500"
          )}
        >
          <Zap size={20} fill={activeTab === 'home' ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">转换器</span>
        </button>
        <button 
          onClick={() => setActiveTab('me')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'me' ? "text-niuma-yellow" : "text-zinc-500"
          )}
        >
          <User size={20} fill={activeTab === 'me' ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">我的</span>
        </button>
      </nav>
    </div>
  );
}
