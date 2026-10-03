import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateAcademicPdfReport } from '../utils/exportPdf';
import { generateCsvExcelReport } from '../utils/exportExcel';
import { downloadProjectZip } from '../utils/downloadProjectZip';
import {
  X,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  Download,
  FolderArchive,
  Code2
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { activeGroup, groupTasks } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen || !activeGroup) return null;

  const handleExportPdf = () => {
    try {
      generateAcademicPdfReport(activeGroup, groupTasks);
      setDownloadSuccess('Laporan PDF resmi akademik berhasil diunduh!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    try {
      generateCsvExcelReport(activeGroup, groupTasks);
      setDownloadSuccess('Rekap data Excel / CSV berhasil diunduh!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadProjectZip();
      setDownloadSuccess('File zip proyek berhasil diunduh! Ekstrak dan buka di VS Code.');
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Ekspor Laporan & Unduh Proyek
              </h2>
              <p className="text-xs text-slate-400">
                Laporan Akademik, Spreadsheet, atau Full Source Code untuk VS Code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* VS Code Direct ZIP Download Card */}
          <div
            onClick={handleDownloadZip}
            className="group p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    Unduh Folder Proyek untuk VS Code (.ZIP)
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    Full Code
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Paket lengkap seluruh folder (<code className="font-mono text-indigo-600 dark:text-indigo-400">src/components</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400">views</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400">context</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400">utils</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400">types</code>, config, dan README panduan jalankan).
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Download className="w-3.5 h-3.5" />
                  <span>{isZipping ? 'Mengompresi file proyek...' : 'Klik untuk Unduh sim-tugas-mahasiswa-vscode.zip'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            
            {/* PDF Option */}
            <div
              onClick={handleExportPdf}
              className="group p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 bg-white dark:bg-slate-800 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 mb-1">
                Laporan Lengkap PDF
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2.5">
                Format standar kop surat kampus, tabel kontribusi anggota, dan lembar pengesahan dosen.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Unduh PDF <Download className="w-3 h-3" />
              </span>
            </div>

            {/* Excel Option */}
            <div
              onClick={handleExportExcel}
              className="group p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 bg-white dark:bg-slate-800 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 mb-1">
                Rekap Data Excel / CSV
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2.5">
                Spreadsheet tabular untuk analisis nilai, bobot %, log revisi, dan rincian subtask.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Unduh CSV/Excel <Download className="w-3 h-3" />
              </span>
            </div>

          </div>

          {/* Direct Print Option */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan (Print Preview)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
