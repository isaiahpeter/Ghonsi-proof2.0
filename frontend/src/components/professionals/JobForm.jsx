'use client';
import React, { useState } from 'react';

const JobForm = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tags, setTags] = useState('');
  const [remote, setRemote] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const job = {
      title, company, location, type, salary, description,
      requirements, tags: tags.split(',').map(t => t.trim()).filter(Boolean), remote
    };
    onCreate(job);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Job title" className="w-full bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
        <input required value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company" className="w-full bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
        <select value={type} onChange={e=>setType(e.target.value)} className="bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white">
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
        </select>
        <input value={salary} onChange={e=>setSalary(e.target.value)} placeholder="Salary range (optional)" className="bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
      </div>

      <textarea required value={description} onChange={e=>setDescription(e.target.value)} placeholder="Job description" rows={5} className="w-full bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />

      <textarea value={requirements} onChange={e=>setRequirements(e.target.value)} placeholder="Key requirements (comma separated)" rows={2} className="w-full bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />

      <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full bg-[#0B0F1B] border border-[#2A2E3D] rounded px-3 py-2 text-white" />

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={remote} onChange={e=>setRemote(e.target.checked)} /> Remote
        </label>
        <div className="flex-1" />
        <button type="submit" className="bg-[#C19A4A] text-[#0B0F1B] px-4 py-2 rounded-lg font-bold">Create Job</button>
      </div>
    </form>
  );
};

export default JobForm;
