"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/hooks/useDocuments";
import { useCourse } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import DocumentUpload from "./DocumentUpload";
import ChatMessage from "../chat/ChatMessage";

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


interface CourseDetailProps {
  classId: string;
}

export default function CourseDetail({ classId }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "people" | "chat">("materials");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const { course, loading: courseLoading, error: courseError } = useCourse(classId);
  const { documents, loading: documentsLoading, error: documentsError, uploadDocument } = useDocuments(classId);
  const { messages, loading: messagesLoading, error: messagesError, connected: wsConnected, sendMessage, deleteMessage } = useWebSocketMessages(classId);

  const courseCode = course ? `${course.class_subject} ${course.class_number}` : "Loading...";
  const courseName = course ? course.college_name : "Loading...";
  
  const colors = [
    "from-green-400 to-green-600",
    "from-blue-400 to-blue-600", 
    "from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600",
    "from-red-400 to-red-600",
    "from-yellow-400 to-yellow-600",
    "from-indigo-400 to-indigo-600"
  ];
  const colorIndex = parseInt(classId.replace(/\D/g, '').slice(0, 2) || '0') % colors.length;
  const courseColor = colors[colorIndex];

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleDownload = (docPath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = docPath;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMessage = (person: Person) => {
    console.log("Messaging:", person.name);
  };

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      const success = await sendMessage(messageInput);
      if (success) {
        setMessageInput("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (file: File, title?: string, description?: string): Promise<boolean> => {
    try {
      const result = await uploadDocument(file, classId);
      if (result) {
        setShowUploadModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Upload failed:', error);
      return false;
    }
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

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {activeTab === "materials" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
              <button
                onClick={handleUpload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Material</span>
              </button>
            </div>

            {documentsLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            )}

            {documentsError && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">Error loading documents</p>
                <p className="text-gray-600 text-sm">{documentsError}</p>
              </div>
            )}

            {!documentsLoading && !documentsError && (
              <>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(doc => {
                      const fileName = doc.doc_path.split('/').pop() || 'Unknown file';
                      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                      
                      const getDocIcon = (docType: string) => {
                        const iconMap: { [key: string]: string } = {
                          pdf: '📄',
                          document: '📝',
                          presentation: '📊',
                          spreadsheet: '📈',
                          image: '🖼️',
                          video: '🎥',
                          archive: '🗜️',
                          other: '📎'
                        };
                        return iconMap[docType] || '📎';
                      };

                      return (
                        <div
                          key={doc.doc_id}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="text-3xl">{getDocIcon(doc.doc_type)}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                                {fileName.replace(/\.[^/.]+$/, "")}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString()} • {fileExt.toUpperCase()}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                by {doc.user?.full_name || 'Anonymous'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDownload(doc.doc_path, fileName)}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-all text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-300 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-600 mb-4">Get started by uploading your first study material.</p>
                    <button
                      onClick={handleUpload}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload First Document
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "people" && (
          <div className="space-y-8">
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

        {activeTab === "chat" && (
          <div className="bg-white rounded-xl border border-gray-200 h-[600px] flex flex-col shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-900">Course Chat</h2>
              <p className="text-sm text-gray-600">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {messagesError && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 font-medium">Error loading messages</p>
                    <p className="text-gray-600 text-sm">{messagesError}</p>
                  </div>
                </div>
              )}

              {!messagesLoading && !messagesError && messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">Start the conversation by sending the first message!</p>
                  </div>
                </div>
              )}

              {!messagesLoading && !messagesError && messages.map(message => (
                <ChatMessage
                  key={message.message_id}
                  message={message}
                  isCurrentUser={message.user_id === user?.id}
                  onDelete={deleteMessage}
                />
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={messagesLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || messagesLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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

      <DocumentUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadSubmit}
        loading={documentsLoading}
      />
    </div>
  );
}