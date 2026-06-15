import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <div className="mb-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Go Back</span>
      </button>
    </div>
  );
}
