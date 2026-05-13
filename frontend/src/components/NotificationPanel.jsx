import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';

const severityColors = {
  critical: 'bg-red-50 border-red-200',
  high: 'bg-orange-50 border-orange-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-blue-50 border-blue-200'
};

const severityBadgeColors = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700'
};

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    setPortalRoot(document.getElementById('app-shell'));
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPanel = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      ));
      fetchUnreadCount();
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      fetchUnreadCount();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleTogglePanel = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    fetchNotifications();
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={handleTogglePanel}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          portalRoot
            ? createPortal(
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="absolute inset-0 bg-black/20 z-30"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-xl z-40 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-primary to-primary-dark text-white">
                    <h2 className="text-lg font-bold">{t('notifications', language)}</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action Bar */}
                  {unreadCount > 0 && (
                    <div className="px-4 py-2 border-b border-slate-200 flex gap-2">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        <CheckCheck className="w-4 h-4" />
                        {t('markAllRead', language)}
                      </button>
                    </div>
                  )}

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-slate-500">{t('loading', language)}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32">
                        <Bell className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm">{t('noNotifications', language)}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {notifications.map(notification => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border-l-4 ${severityColors[notification.severity]} group hover:shadow-sm transition-all`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm text-slate-900">{notification.title}</h3>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${severityBadgeColors[notification.severity]}`}>
                                    {notification.severity}
                                  </span>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary ml-auto" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{notification.message}</p>
                                {notification.patient && (
                                  <p className="text-xs text-slate-500">
                                    {t('patient', language)}: <span className="font-semibold">{notification.patient.name}</span>
                                  </p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
                                    <CheckCheck className="w-4 h-4 text-slate-600" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification._id)}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
              , portalRoot)
            : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="absolute inset-0 bg-black/20 z-30"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-xl z-40 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-primary to-primary-dark text-white">
                    <h2 className="text-lg font-bold">{t('notifications', language)}</h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action Bar */}
                  {unreadCount > 0 && (
                    <div className="px-4 py-2 border-b border-slate-200 flex gap-2">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        <CheckCheck className="w-4 h-4" />
                        {t('markAllRead', language)}
                      </button>
                    </div>
                  )}

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-slate-500">{t('loading', language)}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32">
                        <Bell className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm">{t('noNotifications', language)}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {notifications.map(notification => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border-l-4 ${severityColors[notification.severity]} group hover:shadow-sm transition-all`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm text-slate-900">{notification.title}</h3>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${severityBadgeColors[notification.severity]}`}>
                                    {notification.severity}
                                  </span>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary ml-auto" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{notification.message}</p>
                                {notification.patient && (
                                  <p className="text-xs text-slate-500">
                                    {t('patient', language)}: <span className="font-semibold">{notification.patient.name}</span>
                                  </p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
                                    <CheckCheck className="w-4 h-4 text-slate-600" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification._id)}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )
        )}
      </AnimatePresence>
    </>
  );
}
