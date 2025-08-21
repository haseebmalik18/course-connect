"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Material {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc" | "slides";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
}

interface Person {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  avatar: string;
  role: "mentor" | "peer";
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

// Sample data
const sampleMaterials: Material[] = [
  {
    id: "1",
    name: "Chapter 1 - Cell Structure Notes.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2 days ago",
    downloadUrl: "#"
  },
  {
    id: "2",
    name: "Midterm Study Guide.pdf",
    type: "pdf",
    size: "1.8 MB",
    uploadedBy: "Michael Rodriguez",
    uploadedAt: "1 week ago",
    downloadUrl: "#"
  },
  {
    id: "3",
    name: "Lab Report Template.docx",
    type: "doc",
    size: "156 KB",
    uploadedBy: "Emily Johnson",
    uploadedAt: "2 weeks ago",
    downloadUrl: "#"
  },
  {
    id: "4",
    name: "Lecture Slides - Week 3.pptx",
    type: "slides",
    size: "5.2 MB",
    uploadedBy: "Alex Kim",
    uploadedAt: "3 weeks ago",
    downloadUrl: "#"
  },
  {
    id: "5",
    name: "Mitosis Diagram.png",
    type: "image",
    size: "890 KB",
    uploadedBy: "Jessica Liu",
    uploadedAt: "1 month ago",
    downloadUrl: "#"
  },
  {
    id: "6",
    name: "Final Exam Practice Problems.pdf",
    type: "pdf",
    size: "3.1 MB",
    uploadedBy: "David Park",
    uploadedAt: "1 month ago",
    downloadUrl: "#"
  }
];

const samplePeople: Person[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@hunter.cuny.edu",
    major: "Biology",
    year: "Senior",
    avatar: "SC",
    role: "mentor"
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael.r@baruch.cuny.edu",
    major: "Pre-Med",
    year: "Junior",
    avatar: "MR",
    role: "mentor"
  },
  {
    id: "3",
    name: "Emily Johnson",
    email: "emily.j@ccny.cuny.edu",
    major: "Biochemistry",
    year: "Senior",
    avatar: "EJ",
    role: "mentor"
  },
  {
    id: "4",
    name: "Alex Kim",
    email: "alex.kim@qc.cuny.edu",
    major: "Biology",
    year: "Sophomore",
    avatar: "AK",
    role: "peer"
  },
  {
    id: "5",
    name: "Jessica Liu",
    email: "jessica.liu@hunter.cuny.edu",
    major: "Neuroscience",
    year: "Sophomore",
    avatar: "JL",
    role: "peer"
  },
  {
    id: "6",
    name: "David Park",
    email: "david.p@brooklyn.cuny.edu",
    major: "Biology",
    year: "Freshman",
    avatar: "DP",
    role: "peer"
  }
];

const sampleMessages: Message[] = [
  {
    id: "1",
    sender: "Sarah Chen",
    content: "Hey everyone! Just uploaded my notes from today's lecture.",
    timestamp: "2:30 PM",
    isCurrentUser: false
  },
  {
    id: "2",
    sender: "You",
    content: "Thanks Sarah! These are really helpful.",
    timestamp: "2:35 PM",
    isCurrentUser: true
  },
  {
    id: "3",
    sender: "Michael Rodriguez",
    content: "Does anyone have the practice problems from last week?",
    timestamp: "3:15 PM",
    isCurrentUser: false
  },
  {
    id: "4",
    sender: "Emily Johnson",
    content: "I'll upload them in a few minutes!",
    timestamp: "3:20 PM",
    isCurrentUser: false
  }
];

interface CourseDetailProps {
  courseCode?: string;
  courseName?: string;
  courseColor?: string;
}

export default function CourseDetail({ 
  courseCode = "BIO 201", 
  courseName = "Principles of Biology",
  courseColor = "from-green-400 to-green-600"
}: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "people" | "chat">("materials");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleDownload = (material: Material) => {
    console.log("Downloading:", material.name);
  };

  const handleMessage = (person: Person) => {
    console.log("Messaging:", person.name);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  const handleUpload = () => {
    console.log("Upload clicked");
    setShowUploadModal(true);
  };

  const getFileIcon = (type: Material["type"]) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "doc":
        return "📝";
      case "slides":
        return "📊";
      case "image":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const mentors = samplePeople.filter(p => p.role === "mentor");
  const peers = samplePeople.filter(p => p.role === "peer");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{courseCode}</h1>
                <p className="text-sm text-gray-600">{courseName}</p>
              </div>
            </div>
            <div className={`h-2 w-32 bg-gradient-to-r ${courseColor} rounded-full`}></div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "materials" as const, label: "Materials", icon: "📁" },
              { id: "people" as const, label: "People", icon: "👥" },
              { id: "chat" as const, label: "Chat", icon: "💬" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
              <button
                onClick={handleUpload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Material</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleMaterials.map(material => (
                <div
                  key={material.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{getFileIcon(material.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{material.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{material.size} • {material.uploadedAt}</p>
                      <p className="text-xs text-gray-600 mt-1">by {material.uploadedBy}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(material)}
                    className="mt-3 w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People Tab */}
        {activeTab === "people" && (
          <div className="space-y-8">
            {/* Mentors Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mentors (Already Took This Course)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map(person => (
                  <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600">{person.year} • {person.major}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMessage(person)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Message</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Buddies Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Study Buddies (Taking Now)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {peers.map(person => (
                  <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600">{person.year} • {person.major}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMessage(person)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Message</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Course Chat</h2>
              <p className="text-sm text-gray-600">12 members online</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {sampleMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.isCurrentUser ? "order-2" : ""}`}>
                    {!message.isCurrentUser && (
                      <p className="text-xs text-gray-600 mb-1">{message.sender}</p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chapter 5 Notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the material..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose File
                </label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Uploading file...");
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}