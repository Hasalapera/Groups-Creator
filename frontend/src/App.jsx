import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import GroupDashboard from './components/GroupDashboard';
import { Download, RefreshCw, Layers } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUploadSuccess = (responseData) => setData(responseData);
  const handleReset = () => setData(null);

  const handleDownloadPDF = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const response = await axios.post('http://localhost:8000/download-pdf', 
        { groups: data.groups },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'groups.pdf');
      link.click();
    } catch (err) {
      alert("Export failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-50">
      {/* Header: Pure white with thin border on scroll */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-white py-6'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              GroupBalancer
            </h1>
          </div>
          
          <AnimatePresence>
            {data && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <button onClick={handleReset} className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                >
                  {downloading ? 'Exporting...' : 'Export PDF'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-20"
            >
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">
                  Smart Grouping. <br/> Zero Effort.
                </h2>
                <p className="text-slate-500 text-lg">
                  Upload your student list to generate balanced teams instantly.
                </p>
              </div>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-12">
                 <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Results</h2>
                 <div className="flex gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                      {data.total_students} STUDENTS
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                      {data.groups.length} GROUPS
                    </span>
                 </div>
              </div>
              <GroupDashboard groupsData={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;