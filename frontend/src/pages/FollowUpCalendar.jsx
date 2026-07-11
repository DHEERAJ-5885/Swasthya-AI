import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Loader2, Plus, Calendar as CalendarIcon, MapPin, Activity, User, AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import MobileHeader from '../components/MobileHeader';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function FollowUpCalendar() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterVillage, setFilterVillage] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchFollowUps = async () => {
    try {
      const res = await api.get('/followups/calendar');
      
      const formattedEvents = res.data.map(f => {
        let bgColor = '#10b981'; // Low Risk - Green
        if (f.status === 'Completed') bgColor = '#3b82f6'; // Blue
        else if (f.status === 'Missed') bgColor = '#94a3b8'; // Gray
        else if (f.riskLevel === 'Critical') bgColor = '#7f1d1d'; // Dark Red
        else if (f.riskLevel === 'High Risk') bgColor = '#ef4444'; // Red
        else if (f.riskLevel === 'Medium Risk') bgColor = '#f97316'; // Orange

        // Construct Date string (combine date and time if available)
        const dateObj = new Date(f.date);
        let startStr = dateObj.toISOString().split('T')[0];
        if (f.time) {
          startStr += `T${f.time}:00`;
        }

        return {
          id: f._id,
          title: `${f.patientName || 'Unknown'} - ${f.reason || 'Follow-up'}`,
          start: startStr,
          backgroundColor: bgColor,
          borderColor: bgColor,
          extendedProps: { ...f }
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      toast.error('Failed to load calendar events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const handleDateClick = (info) => {
    // Optionally create new follow up on this date
  };

  const markCompleted = async (id) => {
    try {
      await api.put(`/followups/${id}/complete`);
      toast.success('Marked as completed!');
      setSelectedEvent(null);
      fetchFollowUps();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const cancelFollowUp = async (id) => {
    if(!window.confirm('Are you sure you want to cancel this follow-up?')) return;
    try {
      await api.delete(`/followups/${id}`);
      toast.success('Follow-up cancelled');
      setSelectedEvent(null);
      fetchFollowUps();
    } catch (err) {
      toast.error('Failed to cancel');
    }
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
      <MobileHeader title="Calendar" />
      
      {/* Filters Bar */}
      <div className="bg-white px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-0 md:top-0 top-[60px] z-10 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2 hidden md:flex">
          <CalendarIcon className="w-6 h-6 text-primary" /> Follow-up Calendar
        </h1>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary flex-1 md:flex-none"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
          </select>
          <select 
            value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary flex-1 md:flex-none"
          >
            <option value="">All Risks</option>
            <option value="High Risk">High Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="Low Risk">Low Risk</option>
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
              dateClick={handleDateClick}
              height="100%"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                list: 'Agenda'
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
          padding: 2px 4px;
          font-size: 0.8rem;
          font-weight: 500;
          border: none;
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
      `}} />

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
                    <h2 className="text-xl font-bold text-slate-900">{selectedEvent.patientName || 'Unknown Patient'}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedEvent.village || 'Unknown Village'}
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
                      <span className="text-sm font-semibold text-slate-700">Schedule</span>
                    </div>
                    <p className="text-slate-900 font-medium">
                      {new Date(selectedEvent.date).toLocaleDateString()} {selectedEvent.time && `at ${selectedEvent.time}`}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">Reason</span>
                    </div>
                    <p className="text-slate-900 text-sm">{selectedEvent.reason || selectedEvent.notes || 'Routine follow-up'}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">Status & Priority</span>
                    </div>
                    <p className="text-slate-900 text-sm font-medium">Status: {selectedEvent.status} | Priority: {selectedEvent.priority}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate(`/patients/${selectedEvent.patientId._id || selectedEvent.patientId}`)} 
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 rounded-xl font-bold"
                  >
                    <User className="w-4 h-4 mr-2" /> View Patient Profile
                  </Button>
                  
                  {selectedEvent.status !== 'Completed' && (
                    <>
                      <Button 
                        onClick={() => navigate(`/screening/${selectedEvent.patientId._id || selectedEvent.patientId}`)} 
                        className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/20"
                      >
                        Start Follow-up Screening <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => markCompleted(selectedEvent._id)} 
                        className="w-full h-12 rounded-xl font-bold border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Completed manually
                      </Button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => cancelFollowUp(selectedEvent._id)}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 mt-2"
                  >
                    Cancel Follow-up
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
