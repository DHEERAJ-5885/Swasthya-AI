import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import api from '../api';

export default function MobileHeader({ title, actions }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setUnreadCount(res.data.pendingAlerts || 0))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 shrink-0 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <div className="relative">
          <button className="p-2 bg-slate-50 rounded-full border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
