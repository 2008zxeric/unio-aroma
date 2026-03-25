import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 统一使用 framer-motion
import { 
  Menu, X, Instagram, Mail, MapPin, Phone, 
  ChevronRight, ArrowRight, Package, ShieldCheck, 
  Leaf, Droplets, Sparkles, Wind, Clock, Star,
  Search, Filter, ShoppingBag, Heart, ExternalLink,
  Facebook, Twitter, Youtube, MessageCircle,
  TrendingUp, BarChart3, Users, Settings, Lock
} from 'lucide-react';
import InventoryApp from './components/InventoryApp';

// --- Navbar 组件 (包含长按逻辑) ---
const Navbar = ({ onLogoLongPress }: { onLogoLongPress: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLogoLongPress();
    }, 3000); // 3秒长按
  };

  const handleEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/80 backdrop-blur-xl py-4 shadow-sm' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
        >
          <div className="w-10 h-10 bg-[#4CAF80] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#4CAF80]/20">
            <Leaf size={24} />
          </div>
          <span className={`text-2xl font-bold tracking-tighter ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
            UNIO<span className="text-[#4CAF80]">.</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-12">
          {['精油系列', '纯露系列', '基础油', '关于我们'].map((item) => (
            <a key={item} href="#" className={`text-sm font-medium tracking-wide hover:text-[#4CAF80] transition-colors ${isScrolled ? 'text-slate-600' : 'text-white/80'}`}>{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}><Search size={20} /></button>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  const [showInventory, setShowInventory] = useState(false);

  if (showInventory) {
    return <InventoryApp onBack={() => setShowInventory(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar onLogoLongPress={() => setShowInventory(true)} />
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=2000" alt="Hero" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0A0A0A]" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.9]">唤醒自然<br /><span className="text-[#4CAF80]">愈合</span>之力</h1>
            <button className="px-10 py-5 bg-[#4CAF80] text-white rounded-full font-bold hover:bg-[#3d9163] transition-all">立即探索</button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
