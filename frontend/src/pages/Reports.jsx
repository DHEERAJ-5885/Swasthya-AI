import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, Search, Filter, Download, FileText, ChevronRight, CheckCircle, ShieldAlert, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import MobileHeader from '../components/MobileHeader';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    api.get('/reports')
      .then(res => {
        setReports(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load reports');
        setLoading(false);
      });
  }, []);

  const downloadPDF = (report) => {
    toast.success('Generating PDF...');
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(79, 70, 229); // Primary color
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Swasthya AI Health Report', 15, 20);
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text(report.title, 15, 45);
      
      doc.setFontSize(10);
      doc.text(`Patient: ${report.patientName}`, 15, 55);
      doc.text(`Village: ${report.village}`, 15, 62);
      doc.text(`Date: ${report.date}`, 15, 69);
      doc.text(`Risk Level: ${report.riskLevel}`, 15, 76);
      
      // AutoTable for Vitals/Symptoms
      const tableData = [];
      if (report.data) {
        Object.keys(report.data).forEach(key => {
          if (report.data[key] && report.data[key] !== 'N/A') {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            tableData.push([formattedKey, report.data[key]]);
          }
        });
      }

      if (tableData.length > 0) {
        doc.autoTable({
          startY: 85,
          head: [['Metric / Symptom', 'Value']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }
        });
      }

      // AI Insights Section
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 90;
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text('AI Health Assessment', 15, finalY);
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      const splitExplanation = doc.splitTextToSize(`Explanation: ${report.explanation}`, 180);
      doc.text(splitExplanation, 15, finalY + 8);
      
      const nextActionY = finalY + 8 + (splitExplanation.length * 5) + 5;
      const splitAction = doc.splitTextToSize(`Recommendation: ${report.recommendation}`, 180);
      doc.text(splitAction, 15, nextActionY);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated automatically by Swasthya AI Platform', 105, 290, { align: 'center' });

      doc.save(`Swasthya_Report_${report.patientName.replace(/\s+/g, '_')}_${report.date.replace(/\//g, '-')}.pdf`);
      toast.success('Report downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  };

  const filteredReports = reports.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pl-64 flex flex-col md:flex-row">
      <MobileHeader title="Health Reports" />
      
      {/* Left List Pane */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-slate-200 bg-[#F8FAFC] flex flex-col h-screen md:sticky md:top-0">
        <div className="p-6 pb-4 bg-[#F8FAFC]/80 backdrop-blur-md z-10 border-b border-slate-100 sticky top-[60px] md:top-0">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Health Reports</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Clinical Summaries</p>
          </div>
          
          <div className="mt-2 md:mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {filteredReports.map((report) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                selectedReport?.id === report.id 
                  ? 'bg-primary/5 border-primary/20 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${report.riskLevel === 'High' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{report.title}</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{report.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-slate-700">{report.patientName}</span>
                <span>•</span>
                <span>{report.village}</span>
              </div>
            </motion.div>
          ))}
          {filteredReports.length === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600">No Reports Found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className={`flex-1 bg-white h-screen overflow-y-auto ${!selectedReport && 'hidden md:flex'}`}>
        {selectedReport ? (
          <div className="max-w-3xl mx-auto w-full">
            <div className="p-6 md:p-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    selectedReport.riskLevel === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {selectedReport.riskLevel} Risk
                  </span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wider">
                    {selectedReport.status}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedReport.title}</h2>
              </div>
              <button 
                onClick={() => downloadPDF(selectedReport)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all shrink-0"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              {/* Patient Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Name</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReport.patientName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Village</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReport.village}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Report ID</p>
                  <p className="text-sm font-bold text-slate-900">#{selectedReport.id.substring(0,6).toUpperCase()}</p>
                </div>
              </div>

              {/* AI Assessment */}
              <Card className="bg-primary/5 border-primary/10 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-slate-900">AI Clinical Assessment</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6">
                    {selectedReport.explanation}
                  </p>
                  
                  <div className="bg-white rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-orange-500" />
                      <p className="text-xs font-bold text-slate-900 uppercase">Recommended Action</p>
                    </div>
                    <p className="text-sm text-slate-700 font-semibold">{selectedReport.recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Data Table */}
              {selectedReport.data && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Recorded Vitals & Symptoms</h3>
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metric</th>
                          <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(selectedReport.data).filter(k => selectedReport.data[k] && selectedReport.data[k] !== 'N/A').map((key, idx) => (
                          <tr key={key} className={idx !== 0 ? 'border-t border-slate-50' : ''}>
                            <td className="py-3 px-4 text-xs font-semibold text-slate-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </td>
                            <td className="py-3 px-4 text-xs font-bold text-slate-900">
                              {selectedReport.data[key]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-1">Select a Report</h2>
            <p className="text-sm text-slate-500 max-w-sm">Choose a health report from the list on the left to view detailed insights and export to PDF.</p>
          </div>
        )}
      </div>

    </div>
  );
}
