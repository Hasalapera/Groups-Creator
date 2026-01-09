import React, { useRef, useState } from 'react';
import { Upload, FileUp, Loader2, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

const FileUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupConfig, setGroupConfig] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleFile = async (file) => {
    setError('');
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    if (groupConfig.trim()) {
      formData.append('group_config', groupConfig.trim());
    }

    try {
      // Simulate slight delay for effect if very fast
      // const response = await axios.post('http://localhost:8000/upload', formData, 
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-xl mx-auto px-4"
    >
      <div className="glass-card p-2 md:p-3 shadow-premium"> {/* glass-card from our CSS */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all duration-500 group cursor-pointer overflow-hidden",
            dragActive 
              ? "border-indigo-400 bg-indigo-50/40 scale-[0.99]" 
              : "border-slate-200/60 hover:border-indigo-300 hover:bg-white/50 bg-white/30"
          )}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={onButtonClick}
        >
          {/* Subtle Glow Effect inside dropzone */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-500" />
          
          <input ref={inputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleChange} />

          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-2xl shadow-indigo-200/50",
              dragActive ? "bg-indigo-600 rotate-[15deg] scale-110" : "bg-white group-hover:rotate-6"
            )}>
              {loading ? (
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              ) : (
                <Upload className={cn("w-10 h-10", dragActive ? "text-white" : "text-indigo-500")} />
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                {loading ? "Processing..." : "Drop file here"}
              </h3>
              <p className="text-slate-500 font-medium">Excel or CSV</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Group Structure Configuration
            </label>
            <div className="relative group">
              <input
                type="text"
                value={groupConfig}
                onChange={(e) => setGroupConfig(e.target.value)}
                placeholder="e.g., 16x4, 3x3"
                className="w-full pl-4 pr-4 py-4 bg-white/50 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-semibold shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Toast-style Notification */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-red-500 text-white rounded-2xl text-sm text-center font-bold shadow-lg shadow-red-200"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default FileUpload;
