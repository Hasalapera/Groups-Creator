import React from 'react';
import { User, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Rank styles helper
const getRankStyles = (index) => {
  switch(index) {
    case 0: return {
      border: "border-yellow-200",
      bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
      text: "text-amber-700",
      icon: "text-yellow-500",
      badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
      shadow: "hover:shadow-yellow-500/20"
    };
    case 1: return {
      border: "border-slate-300",
      bg: "bg-gradient-to-r from-slate-50 to-slate-100",
      text: "text-slate-700",
      icon: "text-slate-500",
      badge: "bg-slate-200 text-slate-700 border-slate-300",
      shadow: "hover:shadow-slate-500/20"
    };
    case 2: return {
      border: "border-orange-200",
      bg: "bg-gradient-to-r from-orange-50 to-amber-50/50",
      text: "text-orange-800",
      icon: "text-orange-500",
      badge: "bg-orange-100 text-orange-800 border-orange-200",
      shadow: "hover:shadow-orange-500/20"
    };
    default: return {
      border: "border-indigo-50",
      bg: "bg-gradient-to-r from-indigo-50/30 to-white",
      text: "text-indigo-900",
      icon: "text-indigo-400",
      badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
      shadow: "hover:shadow-indigo-500/10"
    };
  }
};

const GroupDashboard = ({ groupsData }) => {
  const { groups } = groupsData;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {groups.map((group, idx) => {
          const styles = getRankStyles(idx);
          
          return (
            <motion.div variants={item} key={group.group_number} 
              className="group glass-card hover:bg-white/90 transition-all duration-500 hover:scale-[1.02] active:scale-95 border-none shadow-premium relative"
            >
              {/* Colored accent bar at top of card */}
              <div className={cn("h-1.5 w-full rounded-t-3xl", 
                idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-orange-400" : "bg-indigo-400/20"
              )} />

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-100", 
                      idx === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400")}>
                      {group.group_number}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 tracking-tight">Group {group.group_number}</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Avg GPA: {group.average_gpa.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {idx === 0 && <Trophy className="w-6 h-6 text-amber-500 animate-pulse-slow" />}
                </div>

                <div className="space-y-2">
                  {group.members.map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-white transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                         </div>
                        <span className="font-bold text-slate-700 text-sm">{member.TG}</span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-white/80 border border-slate-100 text-xs font-black text-indigo-600">
                        {member.GPA.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GroupDashboard;