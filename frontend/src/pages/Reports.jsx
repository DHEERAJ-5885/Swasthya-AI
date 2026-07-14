import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, Search, Filter, Download, FileText, ShieldAlert, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import MobileHeader from '../components/MobileHeader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

import { getCachedReports, cacheReports } from '../utils/offlineStore';

export default function Reports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (navigator.onLine) {
      api.get('/reports')
        .then(async res => {
          setReports(res.data);
          await cacheReports(res.data);
          setLoading(false);
        })
        .catch(async () => {
          toast.error(t('reports.errLoad'));
          const cached = await getCachedReports();
          if (cached && cached.length > 0) setReports(cached);
          setLoading(false);
        });
    } else {
      getCachedReports().then(cached => {
        if (cached && cached.length > 0) setReports(cached);
        setLoading(false);
      });
    }
  }, [t]);

  const downloadPDF = (report) => {
    toast.success(t('reports.generatingPdf'));
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header Background
      doc.setFillColor(79, 70, 229); // Primary color
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo / Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SWASTHYA AI", 15, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(t('reports.pdf.clinicalScreening'), 15, 28);
      
      // Report ID & Date (Right aligned in header)
      doc.setFontSize(10);
      doc.text(`${t('reports.pdf.reportId')}: #${(report.id || '').substring(0,8).toUpperCase()}`, pageWidth - 15, 20, { align: 'right' });
      doc.text(`${t('reports.pdf.date')}: ${report.date} ${report.time || ''}`, pageWidth - 15, 28, { align: 'right' });
      
      // Section: Patient Information
      let currentY = 45;
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t('reports.pdf.patientInfo'), 15, currentY);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);
      currentY += 10;
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const leftColX = 15;
      const rightColX = pageWidth / 2 + 10;
      
      doc.text(`${t('reports.pdf.patientName')}: ${report.patientName}`, leftColX, currentY);
      doc.text(`${t('reports.pdf.patientId')}: ${(report.patientId || t('reports.pdf.na')).toString().substring(0,8)}`, rightColX, currentY);
      currentY += 8;
      
      doc.text(`${t('reports.pdf.age')}: ${report.age || t('reports.pdf.na')}`, leftColX, currentY);
      doc.text(`${t('reports.pdf.gender')}: ${report.gender || t('reports.pdf.na')}`, rightColX, currentY);
      currentY += 8;
      
      doc.text(`${t('reports.pdf.village')}: ${report.village}`, leftColX, currentY);
      currentY += 12;
      
      // Section: Health Status
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t('reports.pdf.healthStatus'), 15, currentY);
      doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);
      currentY += 10;
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      
      // Determine risk color
      let riskColor = [34, 197, 94]; // Green for Low
      if (report.riskLevel === 'High Risk') riskColor = [239, 68, 68]; // Red
      if (report.riskLevel === 'Medium Risk') riskColor = [249, 115, 22]; // Orange
      
      doc.text(`${t('reports.pdf.healthScore')}:`, leftColX, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(`${report.healthScore !== undefined ? report.healthScore : t('reports.pdf.na')}/100`, leftColX + 25, currentY);
      
      doc.setFont("helvetica", "normal");
      doc.text(`${t('reports.pdf.riskLevel')}:`, rightColX, currentY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(`${report.riskLevel}`, rightColX + 22, currentY);
      currentY += 10;
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${t('reports.pdf.aiRiskAssessment')}:`, 15, currentY);
      doc.setFont("helvetica", "normal");
      
      const splitAssessment = doc.splitTextToSize(report.explanation || t('reports.pdf.noAssessment'), pageWidth - 30);
      currentY += 6;
      doc.text(splitAssessment, 15, currentY);
      currentY += (splitAssessment.length * 5) + 6;
      
      // Check if we need a new page for Vitals/Symptoms
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      
      // Vitals & Symptoms AutoTable
      const tableData = [];
      if (report.data) {
        Object.keys(report.data).forEach(key => {
          if (report.data[key] && report.data[key] !== 'N/A' && report.data[key] !== '') {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            tableData.push([formattedKey, report.data[key]]);
          }
        });
      }

      if (tableData.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [[t('reports.pdf.metricSymptom'), t('reports.pdf.recordedValue')]],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 15, right: 15 }
        });
        currentY = doc.lastAutoTable.finalY + 15;
      }
      
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      
      // Section: Recommendations
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t('reports.pdf.actionPlan'), 15, currentY);
      doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);
      currentY += 10;
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${t('reports.pdf.aiRecommendations')}:`, 15, currentY);
      doc.setFont("helvetica", "normal");
      const splitRec = doc.splitTextToSize(report.recommendation || t('reports.pdf.followUpNormally'), pageWidth - 30);
      currentY += 6;
      doc.text(splitRec, 15, currentY);
      currentY += (splitRec.length * 5) + 4;
      
      doc.setFont("helvetica", "bold");
      doc.text(`${t('reports.pdf.followUpSchedule')}:`, 15, currentY);
      doc.setFont("helvetica", "normal");
      let followupText = t('reports.pdf.followUp1Month');
      if (report.riskLevel === 'High Risk') followupText = t('reports.pdf.immediateFollowUp');
      else if (report.riskLevel === 'Medium Risk') followupText = t('reports.pdf.followUp7Days');
      currentY += 6;
      doc.text(followupText, 15, currentY);
      currentY += 10;
      
      if (report.riskLevel === 'High Risk') {
        doc.setTextColor(239, 68, 68);
        doc.setFont("helvetica", "bold");
        doc.text(t('reports.pdf.emergencyRecommendation'), 15, currentY);
        doc.setFont("helvetica", "normal");
        const emerg = doc.splitTextToSize(t('reports.pdf.emergencyText'), pageWidth - 30);
        currentY += 6;
        doc.text(emerg, 15, currentY);
      }
      
      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        doc.text(t('reports.pdf.generatedBy'), pageWidth / 2, 285, { align: 'center' });
        doc.text(`${t('reports.pdf.timestamp')}: ${report.timestamp || new Date().toLocaleString()}`, pageWidth / 2, 290, { align: 'center' });
        doc.text(`${t('reports.pdf.page')} ${i} ${t('reports.pdf.of')} ${pageCount}`, pageWidth - 15, 290, { align: 'right' });
      }

      doc.save(`Swasthya_Report_${report.patientName.replace(/\s+/g, '_')}_${report.date.replace(/\//g, '-')}.pdf`);
      toast.success(t('reports.downloadSuccess'));
    } catch (e) {
      console.error(e);
      // Show the real error message to the user
      toast.error(`${t('reports.pdf.unableToGeneratePdf')} ${e.message || t('reports.pdf.pleaseTryAgain')}`);
    }
  };

  const filteredReports = reports.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 w-full bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden">
      <MobileHeader title={t('reports.healthReports')} />
      
      {/* Left List Pane */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-slate-200 bg-[#F8FAFC] flex flex-col h-full overflow-hidden">
        <div className="p-6 pb-4 bg-[#F8FAFC]/80 backdrop-blur-md z-10 border-b border-slate-100 sticky top-[60px] md:top-0">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('reports.healthReports')}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t('reports.clinicalSummaries')}</p>
          </div>
          
          <div className="mt-2 md:mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={t('reports.searchPlaceholder')}
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
                  <div className={`p-1.5 rounded-lg ${report.riskLevel === 'High Risk' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
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
              <p className="text-sm font-bold text-slate-600">{t('reports.noReports')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('reports.tryDifferent')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className={`flex-1 bg-white h-full overflow-y-auto ${!selectedReport && 'hidden md:flex'}`}>
        {selectedReport ? (
          <div className="max-w-3xl mx-auto w-full">
            <div className="p-6 md:p-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    selectedReport.riskLevel === 'High Risk' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {selectedReport.riskLevel} {t('reports.risk')}
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
                <Download className="w-4 h-4" /> {t('reports.downloadPdfBtn')}
              </button>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              {/* Patient Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('reports.patientName')}</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReport.patientName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('reports.village')}</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReport.village}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('reports.date')}</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('reports.reportId')}</p>
                  <p className="text-sm font-bold text-slate-900">#{selectedReport.id.substring(0,6).toUpperCase()}</p>
                </div>
              </div>

              {/* AI Assessment */}
              <Card className="bg-primary/5 border-primary/10 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-slate-900">{t('reports.aiClinicalAssessment')}</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6">
                    {selectedReport.explanation}
                  </p>
                  
                  <div className="bg-white rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-orange-500" />
                      <p className="text-xs font-bold text-slate-900 uppercase">{t('reports.recommendedAction')}</p>
                    </div>
                    <p className="text-sm text-slate-700 font-semibold">{selectedReport.recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Data Table */}
              {selectedReport.data && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">{t('reports.recordedVitals')}</h3>
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('reports.metric')}</th>
                          <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('reports.value')}</th>
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
            <h2 className="text-lg font-bold text-slate-700 mb-1">{t('reports.selectReport')}</h2>
            <p className="text-sm text-slate-500 max-w-sm">{t('reports.selectReportDesc')}</p>
          </div>
        )}
      </div>

    </div>
  );
}
