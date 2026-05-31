'use client';
import React from 'react';
import { Users } from 'lucide-react';

const JobCard = ({ job, onApply, onManage }) => {
  return (
    <div className="bg-[#151925] rounded-xl p-5 border border-[#C19A4A]/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#0B0F1B] flex items-center justify-center text-[#C19A4A] font-bold">{(job.company||'C').charAt(0)}</div>
            <div>
              <h3 className="text-lg font-bold">{job.title}</h3>
              <div className="text-sm text-gray-400">{job.company} • {job.location || 'Remote'}</div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-3 line-clamp-3">{job.description}</p>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <span className="px-2 py-1 bg-[#0B0F1B] rounded">{job.type || 'Full-time'}</span>
            {job.remote && <span className="px-2 py-1 bg-[#0B0F1B] rounded">Remote</span>}
            {job.salary && <span className="px-2 py-1 bg-[#0B0F1B] rounded">{job.salary}</span>}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <button onClick={onApply} className="bg-[#C19A4A] text-[#0B0F1B] px-3 py-2 rounded-lg font-medium">Apply</button>
          <button onClick={onManage} className="text-gray-400 text-sm flex items-center gap-2"><Users size={14} /> Manage</button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
