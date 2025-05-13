import { useState } from "react";
import { UploadCloud } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  onNotification: (type: "success" | "info" | "warning" | "error", message: string) => void;
  isDragActive?: boolean;
  uploading?: boolean;
  file: File | null;
  className?: string;
  compact?: boolean;
}

export const FileUploader = ({
  onFileUpload,
  onNotification,
  isDragActive = false,
  uploading = false,
  file,
  className = "",
  compact = false,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) {
      onNotification("error", "No file selected for upload");
      return;
    }

    try {
      await onFileUpload(file);
    } catch (error) {
      onNotification("error", "Failed to process file");
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <UploadCloud className="h-5 w-5 animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <label className="inline-flex items-center px-3 sm:px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted-foreground/10 transition-colors text-xs sm:text-sm">
            <UploadCloud className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="truncate max-w-[80px] sm:max-w-[200px]">
              {file ? file.name : "Choose File"}
            </span>
            <input
              type="file"
              accept=".html,text/html"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleUpload(e.dataTransfer.files[0]);
        }
        setIsDragging(false);
      }}
      className={`relative w-full min-h-[150px] sm:min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out p-3 sm:p-6 ${className} ${
        isDragging || isDragActive ? "border-primary bg-muted/30" : "border-muted"
      }`}
    >
      <UploadCloud className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
      <h2 className="text-lg sm:text-2xl font-semibold mt-4">
        No classes yet
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground mt-2 mb-4 sm:mb-6">
        Upload your transcript or manually add classes to get started!
      </p>
      <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-muted rounded-md cursor-pointer hover:bg-muted-foreground/10 transition-colors">
        <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        <span className="text-sm sm:text-base truncate max-w-[140px] sm:max-w-full">
          {file ? file.name : "Choose File"}
        </span>
        <input
          type="file"
          accept=".html,text/html"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />
      </label>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
        or drag and drop your file here
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
        Use the HTML version of your transcript instead of the PDF Version!
      </p>
    </div>
  );
};