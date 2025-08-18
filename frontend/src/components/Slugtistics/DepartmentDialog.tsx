import React, { useState } from "react";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Department {
  id: string;
  name: string;
  description: string;
  classes: string[];
  color: string;
  avgGPA: number;
}

interface ClassOptions {
  label: string;
  value: string;
}

interface CreateDepartmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDepartment: (
    department: Omit<Department, "id" | "color" | "avgGPA">
  ) => void;
  availableClasses: ClassOptions[];
}

export default function CreateDepartmentDialog({
  isOpen,
  onOpenChange,
  onCreateDepartment,
  availableClasses,
}: CreateDepartmentDialogProps) {
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDescription, setNewDeptDescription] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClassToSelection = (className: string) => {
    if (!selectedClasses.includes(className)) {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleRemoveClassFromSelection = (className: string) => {
    setSelectedClasses(selectedClasses.filter((c) => c !== className));
  };

  const handleCreateDepartment = () => {
    if (newDeptName && selectedClasses.length > 0) {
      onCreateDepartment({
        name: newDeptName,
        description: newDeptDescription,
        classes: selectedClasses,
      });

      // Reset form
      setNewDeptName("");
      setNewDeptDescription("");
      setSelectedClasses([]);
      setSearchTerm("");
      onOpenChange(false);
    }
  };

  const filteredClasses = availableClasses.filter((classOption) =>
    classOption.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-1/2">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
          <DialogDescription>
            Group related classes into a department for analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Department Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="deptName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Department Name
              </label>
              <input
                id="deptName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., CSE Upper Division"
              />
            </div>
            <div>
              <label
                htmlFor="deptDesc"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description
              </label>
              <input
                id="deptDesc"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                value={newDeptDescription}
                onChange={(e) => setNewDeptDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Classes
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Available Classes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available Classes
                  </h4>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {availableClasses.length}
                  </span>
                </div>

                {/* Search Input */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3 h-56 overflow-y-auto bg-gray-50 dark:bg-gray-700/30">
                  <div className="space-y-2">
                    {filteredClasses.map((cls) => (
                      <div
                        key={cls.label}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer group"
                        onClick={() => handleAddClassToSelection(cls.label)}
                      >
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                          {cls.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    ))}
                    {filteredClasses.length === 0 && searchTerm && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">
                          No classes match "{searchTerm}"
                        </p>
                      </div>
                    )}
                    {availableClasses.length === 0 && !searchTerm && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">All classes selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Classes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Selected Classes
                  </h4>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {selectedClasses.length}
                  </span>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3 h-56 overflow-y-auto bg-gray-50 dark:bg-gray-700/30">
                  <div className="space-y-2">
                    {selectedClasses.map((cls) => (
                      <div
                        key={cls}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer group"
                        onClick={() => handleRemoveClassFromSelection(cls)}
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                          {cls}
                        </span>
                      </div>
                    ))}
                    {selectedClasses.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No classes selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                onOpenChange(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDepartment}
              disabled={!newDeptName || selectedClasses.length === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Department ({selectedClasses.length} classes)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
