import { motion } from 'framer-motion';
import { FileText, Search } from 'lucide-react';

const CounselorNotes = () => {
  return (
    <motion.div
      key="counselor-notes"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5 px-4 pt-6"
    >
      <div className="relative overflow-hidden px-1 pt-2 pb-1">
        <div
          className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,144,164,0.10) 0%, transparent 70%)' }}
        />

        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: '#4a90a4' }}
          >
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a90a4' }}>
            Notes
          </span>
        </div>
        <h1 className="text-[1.75rem] font-bold leading-tight mb-1" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
          Counselor Notes
        </h1>
        <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
          Keep track of session notes and client reminders.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', color: '#1a2b38' }}
        />
      </div>

      <div className="rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4a90a4, #7bbccc)' }} />
        <div className="p-6 text-center text-slate-500">
          <p className="font-semibold mb-2" style={{ color: '#1a2b38' }}>
            No notes yet
          </p>
          <p className="text-sm">Create your first counselor note for this session.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CounselorNotes;
