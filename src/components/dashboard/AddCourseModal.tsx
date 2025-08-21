"use client";

import { useState } from "react";
import { Class } from "@/lib/types/database";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: Partial<Class>) => Promise<void>;
  loading?: boolean;
}

export default function AddCourseModal({ isOpen, onClose, onSubmit, loading = false }: AddCourseModalProps) {
  const [formData, setFormData] = useState({
    college_name: "",
    class_subject: "",
    class_number: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.college_name.trim()) {
      newErrors.college_name = "College name is required";
    }

    if (!formData.class_subject.trim()) {
      newErrors.class_subject = "Subject is required";
    }

    if (!formData.class_number.trim()) {
      newErrors.class_number = "Course number is required";
    } else if (isNaN(Number(formData.class_number))) {
      newErrors.class_number = "Course number must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const courseData = {
      college_name: formData.college_name.trim(),
      class_subject: formData.class_subject.trim().toUpperCase(),
      class_number: parseInt(formData.class_number.trim())
    };

    await onSubmit(courseData);
    
    setFormData({
      college_name: "",
      class_subject: "",
      class_number: ""
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      college_name: "",
      class_subject: "",
      class_number: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const cunyColleges = [
    "Baruch College",
    "Brooklyn College", 
    "City College",
    "Hunter College",
    "John Jay College",
    "Lehman College",
    "Queens College",
    "College of Staten Island",
    "York College",
    "NYC College of Technology",
    "Medgar Evers College",
    "Bronx Community College",
    "Borough of Manhattan Community College",
    "Guttman Community College",
    "Hostos Community College",
    "Kingsborough Community College",
    "LaGuardia Community College",
    "Queensborough Community College"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Course</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="college_name" className="block text-sm font-medium text-gray-700 mb-1">
              College
            </label>
            <select
              id="college_name"
              name="college_name"
              value={formData.college_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.college_name ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a college</option>
              {cunyColleges.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
            {errors.college_name && (
              <p className="text-red-500 text-sm mt-1">{errors.college_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="class_subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code
            </label>
            <input
              type="text"
              id="class_subject"
              name="class_subject"
              value={formData.class_subject}
              onChange={handleInputChange}
              placeholder="e.g., BIO, CHEM, MATH, CSCI"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.class_subject ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.class_subject && (
              <p className="text-red-500 text-sm mt-1">{errors.class_subject}</p>
            )}
          </div>

          <div>
            <label htmlFor="class_number" className="block text-sm font-medium text-gray-700 mb-1">
              Course Number
            </label>
            <input
              type="text"
              id="class_number"
              name="class_number"
              value={formData.class_number}
              onChange={handleInputChange}
              placeholder="e.g., 201, 104, 150"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.class_number ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.class_number && (
              <p className="text-red-500 text-sm mt-1">{errors.class_number}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}