import React, { useEffect, useState } from 'react';
import { getPendingTasks, getSyncHistory, removeTask } from '../utils/offlineStore';
import { processSyncQueue } from '../utils/syncEngine';
import { useNetwork } from '../hooks/useNetwork';
import { motion } from 'framer-motion';
import { CloudOff, RefreshCw, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OfflineSyncCenter() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const { isOnline } = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    const tasks = await getPendingTasks();
    const hist = await getSyncHistory();
    setPendingTasks(tasks);
    // Sort history newest first
    setHistory(hist.sort((a, b) => new Date(b.syncedAt) - new Date(a.syncedAt)));
  };

  useEffect(() => {
    loadData();
    // Set up an interval to refresh status if syncing
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline.');
      return;
    }
    setIsSyncing(true);
    await processSyncQueue();
    await loadData();
    setIsSyncing(false);
  };

  const handleDeleteTask = async (id) => {
    await removeTask(id);
    toast.success('Task removed from queue.');
    loadData();
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'CREATE_PATIENT': return '👤 Patient';
      case 'CREATE_SCREENING': return '🩺 Screening';
      case 'CREATE_FOLLOWUP': return '📅 Follow-up';
      case 'CREATE_EMERGENCY': return '🚨 Emergency';
      default: return '📄 Record';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CloudOff className="text-blue-600" />
            Offline Sync Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage records saved while offline and view sync history.
          </p>
        </div>
        <button
          onClick={handleManualSync}
          disabled={!isOnline || isSyncing || pendingTasks.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
            !isOnline || pendingTasks.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronizing...' : 'Sync Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Queue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Queue ({pendingTasks.length})
          </h2>
          
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2 opacity-50" />
              <p>All records are synchronized.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {pendingTasks.map((task) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {getTaskIcon(task.type)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        task.status === 'SYNCHRONIZING' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                    {task.error && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-1">Error: {task.error}</p>
                    )}
                  </div>
                  
                  {task.status === 'FAILED' && (
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-auto"
                      title="Discard failed record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sync History */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recent Sync History
          </h2>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>No sync history available.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {history.map((record) => (
                <div key={record.id} className="p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                  {record.status === 'SUCCESS' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {getTaskIcon(record.type)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(record.syncedAt).toLocaleString()}
                    </p>
                    <p className={`text-xs mt-1 ${record.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
