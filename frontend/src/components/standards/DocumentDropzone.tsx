'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';

interface DocumentDropzoneProps {
  onFileSelect?: (file: File | null) => void;
  className?: string;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onFileSelect,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({ name: file.name, size: sizeFormatted });
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setSelectedFile({ name: file.name, size: sizeFormatted });
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF]">
            Attach Product Specification
          </label>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#1B2B26] text-[#606E66] dark:text-[#BAC5BF] border border-[#D9DDD8] dark:border-[#253831]">
            Optional
          </span>
        </div>
        <span className="text-[11px] text-[#8B978F]">
          PDF, DOCX, TXT (up to 10MB)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        /* Selected File Card */
        <div className="p-3.5 rounded-2xl bg-[#E8EFEA] dark:bg-[#1B2B26] border border-[#D9DDD8] dark:border-[#253831] flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0D3328] flex items-center justify-center text-white shrink-0">
              <FileText className="w-4 h-4 text-[#A7B8AE]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#18211D] dark:text-[#F7F5EF] truncate">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#606E66] dark:text-[#BAC5BF]">
                <span>{selectedFile.size}</span>
                <span>•</span>
                <span className="text-[#1B5E39] dark:text-[#A7F3D0] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Ready for analysis
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-full text-[#8B978F] hover:text-[#C86D51] hover:bg-white dark:hover:bg-[#20312B] transition-colors cursor-pointer"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Dropzone Upload Trigger */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-4 rounded-2xl border border-dashed text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#0D3328] bg-[#E8EFEA] dark:bg-[#1B2B26]'
              : 'border-[#D9DDD8] dark:border-[#253831] bg-[#FAF9F5] dark:bg-[#1B2B26]/60 hover:bg-[#EFECE6] dark:hover:bg-[#1B2B26] hover:border-[#5B8272]'
          }`}
        >
          <div className="flex items-center justify-center gap-2.5 text-xs text-[#606E66] dark:text-[#BAC5BF]">
            <UploadCloud className="w-4 h-4 text-[#5B8272] shrink-0" />
            <span className="font-medium">
              Drag & drop technical specification or <span className="text-[#0D3328] dark:text-[#A7B8AE] underline font-bold">Browse</span>
            </span>
          </div>
          <p className="text-[11px] text-[#8B978F] mt-1">
            Provide additional technical parameters to refine applicability matching
          </p>
        </div>
      )}
    </div>
  );
};
