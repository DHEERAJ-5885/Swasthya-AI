import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { AlertTriangle, MapPin, CheckCircle2, Calendar as CalendarIcon, Loader2, Clock, Activity, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';

export default function FollowUpCalendar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Filters
  const [filterVillage] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Tooltip State
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });

  const fetchFollowUps = async () => {
    try {
      const res = await api.get('/followups/calendar');
      
      const formattedEvents = res.data.map(f => {
        let bgColor = '#10b981'; // Default Green (Low Risk)
        if (f.status === 'Completed') {
          bgColor = '#3b82f6'; // Blue
        } else if (f.status === 'Missed') {
          bgColor = '#64748b'; // Gray
        } else if (f.riskLevel === 'High Risk' || f.riskLevel === 'Critical') {
          bgColor = '#ef4444'; // Red
        } else if (f.riskLevel === 'Medium Risk') {
          bgColor = '#f97316'; // Orange
        }

        // Construct Date string robustly
        let startStr = '';
        try {
          if (!f.date) throw new Error('Missing date');
          const d = new Date(f.date);
          if (isNaN(d.getTime())) throw new Error('Invalid date');
          startStr = d.toISOString().split('T')[0];
          
          if (f.time) {
            // ensure time is in HH:mm format
            const timeMatch = f.time.match(/(\d{2}):(\d{2})/);
            if (timeMatch) {
              startStr += `T${timeMatch[1]}:${timeMatch[2]}:00`;
            }
          }
        } catch (err) {
          console.warn('Skipping event due to invalid date:', f);
          return null;
        }

        return {
          id: f._id,
          title: f.patientName || f.patientId?.name || t('calendar.unknownPatient'),
          start: startStr,
          backgroundColor: bgColor,
          borderColor: bgColor,
          display: 'block',
          extendedProps: { ...f, patientName: f.patientName || f.patientId?.name, village: f.village || f.patientId?.village }
        };
      }).filter(Boolean);
      setEvents(formattedEvents);
    } catch (err) {
      toast.error(t('calendar.failedLoad'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const markCompleted = async (id) => {
    try {
      await api.put(`/followups/${id}`, { status: 'Completed' });
      toast.success(t('calendar.markCompletedSuccess') || 'Follow-up marked as completed');
      setSelectedEvent(null);
      fetchFollowUps();
    } catch (err) {
      toast.error(t('calendar.updateFailed') || 'Failed to update follow-up');
    }
  };

  const cancelFollowUp = async (id) => {
    if (!window.confirm(t('calendar.confirmCancel') || 'Are you sure you want to cancel this follow-up?')) return;
    try {
      await api.delete(`/followups/${id}`);
      toast.success(t('calendar.cancelSuccess') || 'Follow-up cancelled');
      setSelectedEvent(null);
      fetchFollowUps();
    } catch (err) {
      toast.error(t('calendar.updateFailed') || 'Failed to update follow-up');
    }
  };

  const handleMouseEnter = (info) => {
    const { clientX, clientY } = info.jsEvent;
    setTooltip({ show: true, x: clientX, y: clientY, data: info.event.extendedProps });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, data: null });
  };

  const renderEventContent = (eventInfo) => {
    const f = eventInfo.event.extendedProps;
    const isOverdue = f.status === 'Pending' && new Date(f.date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
    const isCompleted = f.status === 'Completed';
    const bgColor = eventInfo.backgroundColor;

    return (
      <div 
        className="w-full flex items-center gap-1 overflow-hidden text-xs font-semibold px-1.5 py-0.5 rounded shadow-sm text-white"
        style={{ backgroundColor: isOverdue ? '#b91c1c' : bgColor }}
      >
        {isOverdue && <AlertTriangle className="w-3 h-3 text-white shrink-0" />}
        {isCompleted && <CheckCircle2 className="w-3 h-3 text-white shrink-0" />}
        <span className="truncate" style={{ flex: 1 }}>
          {f.time && <span className="font-bold mr-1 opacity-90">{f.time}</span>}
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  const dayCellClassNames = (arg) => {
    // Use local timezone to extract YYYY-MM-DD
    const dateStr = arg.date.toLocaleDateString('en-CA');
    const hasFollowUps = events.some(e => e.start.startsWith(dateStr));
    if (arg.isToday && hasFollowUps) {
      return 'today-has-events';
    }
    return '';
  };

  // Apply filters
  const filteredEvents = events.filter(e => {
    if (filterVillage && e.extendedProps.village !== filterVillage) return false;
    if (filterRisk && e.extendedProps.riskLevel !== filterRisk) return false;
    if (filterStatus && e.extendedProps.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 w-full h-full bg-[#F8FAFC] flex flex-col overflow-hidden relative">
      <MobileHeader title={t('calendar.title')} />
      
      {/* Filters Bar */}
      <div className="bg-white px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-0 md:top-0 top-[60px] z-10 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2 hidden md:flex">
          <CalendarIcon className="w-6 h-6 text-primary" /> {t('calendar.title')}
        </h1>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary flex-1 md:flex-none"
          >
            <option value="">{t('calendar.allStatus')}</option>
            <option value="Pending">{t('calendar.pending')}</option>
            <option value="Completed">{t('calendar.completed')}</option>
            <option value="Missed">{t('calendar.missed')}</option>
          </select>
          <select 
            value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary flex-1 md:flex-none"
          >
            <option value="">{t('calendar.allRisks')}</option>
            <option value="High Risk">{t('calendar.highRisk')}</option>
            <option value="Medium Risk">{t('calendar.mediumRisk')}</option>
            <option value="Low Risk">{t('calendar.lowRisk')}</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 min-h-[600px] calendar-wrapper">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              events={filteredEvents}
              eventClick={handleEventClick}
              eventMouseEnter={handleMouseEnter}
              eventMouseLeave={handleMouseLeave}
              eventContent={renderEventContent}
              dayCellClassNames={dayCellClassNames}
              dayMaxEvents={true}
              moreLinkClick="popover"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              buttonText={{
                today: t('calendar.today'),
                month: t('calendar.month'),
                week: t('calendar.week'),
                day: t('calendar.day'),
                list: t('calendar.agenda')
              }}
            />
          </div>
        )}
      </div>

      {/* Custom Styles for FullCalendar */}
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-wrapper .fc-button-primary {
          background-color: #4f46e5 !important;
          border-color: #4f46e5 !important;
        }
        .calendar-wrapper .fc-button-primary:hover {
          background-color: #4338ca !important;
        }
        .calendar-wrapper .fc-button-active {
          background-color: #312e81 !important;
        }
        .calendar-wrapper .fc-event {
          cursor: pointer;
          border-radius: 4px;
          border: none;
          margin-bottom: 2px;
        }
        .calendar-wrapper .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: #0f172a;
        }
        .calendar-wrapper .fc-col-header-cell-cushion {
          color: #475569;
          font-weight: 600;
        }
        .calendar-wrapper .fc-daygrid-day-number {
          color: #334155;
          font-weight: 500;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f1f5f9;
        }
        .fc-day-today {
          background-color: #f0fdf4 !important;
        }
        .fc-day-today .fc-daygrid-day-number {
          color: #166534 !important;
          font-weight: 800 !important;
          background-color: #dcfce7;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px;
        }
        .today-has-events {
          background-color: #dcfce7 !important;
          border: 2px solid #22c55e !important;
        }
        .fc-popover {
          border-radius: 12px !important;
          overflow: hidden !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        }
        .fc-popover-header {
          background: #f8fafc !important;
          padding: 10px 12px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
      `}} />

      {/* Global Floating Tooltip */}
      {tooltip.show && tooltip.data && (
        <div 
          className="fixed z-[100] bg-slate-900 text-white text-xs rounded-xl shadow-xl p-4 w-64 pointer-events-none"
          style={{ 
            left: Math.min(tooltip.x + 15, window.innerWidth - 270), 
            top: Math.min(tooltip.y + 15, window.innerHeight - 200) 
          }}
        >
          <p className="font-bold text-sm mb-1 pb-1 border-b border-slate-700">
            {tooltip.data.patientName || tooltip.data.patientId?.name || t('calendar.unknownPatient')}
          </p>
          <div className="space-y-1.5 mt-2">
            <p className="flex justify-between"><span className="text-slate-400">{t('calendar.village')}:</span> <span className="font-medium">{tooltip.data.village || tooltip.data.patientId?.village || t('calendar.na')}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">{t('calendar.phone')}:</span> <span className="font-medium">{tooltip.data.patientId?.phone || t('calendar.na')}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">{t('calendar.risk')}:</span> <span className="font-medium">{tooltip.data.riskLevel}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">{t('calendar.date')}:</span> <span className="font-medium">{new Date(tooltip.data.date).toLocaleDateString()}</span></p>
            <p className="flex justify-between"><span className="text-slate-400">{t('calendar.worker')}:</span> <span className="font-medium">{tooltip.data.workerId?.name || t('calendar.na')}</span></p>
            <p className="mt-2 text-slate-300 italic line-clamp-2 border-t border-slate-800 pt-2">{tooltip.data.reason || tooltip.data.notes || t('calendar.noReason')}</p>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed top-[10%] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedEvent.patientName || t('calendar.unknownPatient')}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedEvent.village || t('calendar.unknownVillage')}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border 
                    ${selectedEvent.riskLevel === 'High Risk' ? 'text-red-700 bg-red-50 border-red-200' : 
                      selectedEvent.riskLevel === 'Medium Risk' ? 'text-orange-700 bg-orange-50 border-orange-200' : 
                      'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                    {selectedEvent.riskLevel}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{t('calendar.schedule')}</span>
                    </div>
                    <p className="text-slate-900 font-medium">
                      {new Date(selectedEvent.date).toLocaleDateString()} {selectedEvent.time && `at ${selectedEvent.time}`}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{t('calendar.reason')}</span>
                    </div>
                    <p className="text-slate-900 text-sm">{selectedEvent.reason || selectedEvent.notes || t('calendar.routineFollowUp')}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{t('calendar.statusPriority')}</span>
                    </div>
                    <p className="text-slate-900 text-sm font-medium">{t('calendar.status')}: {selectedEvent.status} | {t('calendar.priority')}: {selectedEvent.priority}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate(`/patients/${selectedEvent.patientId._id || selectedEvent.patientId}`)} 
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 rounded-xl font-bold"
                  >
                    <User className="w-4 h-4 mr-2" /> {t('calendar.viewPatientProfile')}
                  </Button>
                  
                  {selectedEvent.status !== 'Completed' && (
                    <>
                      <Button 
                        onClick={() => navigate(`/screening/${selectedEvent.patientId._id || selectedEvent.patientId}`)} 
                        className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/20"
                      >
                        {t('calendar.startScreening')} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => markCompleted(selectedEvent._id)} 
                        className="w-full h-12 rounded-xl font-bold border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> {t('calendar.markCompleted')}
                      </Button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => cancelFollowUp(selectedEvent._id)}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 mt-2"
                  >
                    {t('calendar.cancelFollowUp')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
