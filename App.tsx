
import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, Share2, Microscope, BookOpen } from 'lucide-react';
import { ViewState, Category } from './types';
import { DATABASE, DESTINATIONS, ASSETS } from './constants';
import HomeView from './components/HomeView';
import CollectionsView from './components/CollectionsView';
import AtlasView from './components/AtlasView';
import ChinaAtlasView from './components/ChinaAtlasView';
import OracleView from './components/OracleView';
import ProductDetail from './components/ProductDetail';
import DestinationView from './components/DestinationView';
import ImageLabView from './components/ImageLabView';
import StoryView from './components/StoryView';

const App: React.FC = () => {
  const savedView = localStorage.getItem('unio_view') as ViewState || 'home';
  const savedFilter = localStorage.getItem('unio_filter') as Category || 'yuan';
  const savedSelectedId = localStorage.getItem('unio_selected_id');
  const savedDestId = localStorage.getItem('unio_dest_id');

  const [view, setView] = useState<ViewState>(savedView);
  const [prevView, setPrevView] = useState<ViewState>('home');
  const [filter, setFilter] = useState<Category>(savedFilter);
  const [selectedId, setSelectedId] = useState<string | null>(savedSelectedId);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(savedDestId);
  
  const [showSplash, setShowSplash] = useState(savedView === 'home');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => setShowSplash(false), 1000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  useEffect(() => {
    localStorage.setItem('unio_view', view);
    localStorage.setItem('unio_filter', filter);
    if (selectedId) localStorage.setItem('unio_selected_id', selectedId);
    if (selectedDestId) localStorage.setItem('unio_dest_id', selectedDestId);
  }, [view, filter, selectedId, selectedDestId]);

  const navigateToView = (v: ViewState, cat?: Category) => {
    setPrevView(view);
    if (cat) setFilter(cat);
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (id: string) => {
    setSelectedId(id);
    navigateToView('product');
  };

  const handleSelectDest = (id: string) => {
    setSelectedDestId(id);
    navigateToView('destination');
  };

  const handleLogoClick = () => {
    setShowSplash(true);
    setIsExiting(false);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShowSplash(false);
        setIsExiting(false);
        navigateToView('home');
      }, 1000); 
    }, 1500); 
  };

  return (
    <div className="min-h-screen relative bg-[#F5F5F5] pb-32 overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {showSplash && (
        <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'animate-luxury-mask-exit' : 'animate-luxury-reveal'} px-6`}>
          <div className="relative flex flex-col items-center max-w-lg w-full">
            <img src={ASSETS.logo} className="w-40 sm:w-64 drop-shadow-2xl mb-12 animate-breath" alt="元香 UNIO" />
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-7xl font-serif-zh font-bold tracking-[0.4em] text-[#2C3E28] shimmer-text">元香 UNIO</h2>
              <div className="h-px
