"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/hooks/useDocuments";
import { useCourse, useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import { getEnrolledUsers, deleteDocument } from "@/utils/supabaseHelpers";
import DocumentUpload from "./DocumentUpload";
import DocumentSection from "./DocumentSection";
import ChatMessage from "../chat/ChatMessage";

interface Person {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  college?: string;
  avatar: string;
  role: "owner" | "student" | "mentor";
  joined_at?: string;
}

interface CourseDetailProps {
  classId: string;
}

export default function CourseDetail({ classId }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "people" | "chat">("materials");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [enrolledUsers, setEnrolledUsers] = useState<Person[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { course, loading: courseLoading, error: courseError } = useCourse(classId);
  const { documents, loading: documentsLoading, error: documentsError, uploadDocument } = useDocuments(classId);
  const { messages, loading: messagesLoading, error: messagesError, connected: wsConnected, sendMessage, deleteMessage } = useWebSocketMessages(classId);
  const { joinCourse } = useCourses(user?.id);

  const courseCode = course ? `${course.class_subject} ${course.class_number}` : "Loading...";
  const courseName = course ? course.college_name : "Loading...";

  // Check if current user is enrolled in this course
  const isCurrentUserEnrolled = enrolledUsers.some(person => person.id === user?.id);

  useEffect(() => {
    const fetchEnrolledUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      
      try {
        const { data, error } = await getEnrolledUsers(classId);
        if (error) throw error;
        setEnrolledUsers(data);
      } catch (err: any) {
        setUsersError(err.message || 'Failed to load enrolled users');
      } finally {
        setUsersLoading(false);
      }
    };

    if (classId) {
      fetchEnrolledUsers();
    }
  }, [classId]);
  
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

  const handleUploadSubmit = async (file: File, docName: string, description?: string): Promise<boolean> => {
    try {
      const result = await uploadDocument(file, classId, docName);
      if (result) {
        setShowUploadModal(false);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const result = await deleteDocument(docId);
      if (result.success) {
        window.location.reload();
      } else {
      }
    } catch (error) {
    }
  };

  const handleJoinCourse = async () => {
    try {
      const success = await joinCourse(classId);
      if (success) {
        // Refresh the enrolled users list
        const { data, error } = await getEnrolledUsers(classId);
        if (!error && data) {
          setEnrolledUsers(data);
        }
      }
    } catch (error) {
    }
  };

  const owners = enrolledUsers.filter(p => p.role === "owner");
  const mentors = enrolledUsers.filter(p => p.role === "mentor");
  const students = enrolledUsers.filter(p => p.role === "student");

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
            <div className="flex items-center space-x-4">
              {/* Join Course Button or Enrolled Status */}
              {!isCurrentUserEnrolled ? (
                <button
                  onClick={handleJoinCourse}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Join Course
                </button>
              ) : (
                <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg border border-green-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Enrolled
                </span>
              )}
              <div className={`h-2 w-32 bg-gradient-to-r ${courseColor} rounded-full`}></div>
            </div>
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
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors cursor-pointer ${
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
          <DocumentSection
            documents={documents}
            loading={documentsLoading}
            error={documentsError}
            currentUserId={user?.id}
            onUpload={handleUpload}
            onDownload={handleDownload}
            onDelete={handleDeleteDocument}
          />
        )}

        {activeTab === "people" && (
          <div className="space-y-8">
            {usersLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {usersError && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 font-medium">Error loading people</p>
                  <p className="text-gray-600 text-sm">{usersError}</p>
                </div>
              </div>
            )}

            {!usersLoading && !usersError && (
              <>
                {owners.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Course Creator{owners.length > 1 ? 's' : ''} ({owners.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {owners.map(person => (
                        <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {person.avatar}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{person.name}</h3>
                              <p className="text-sm text-gray-600">{person.year} • {person.major}</p>
                              <p className="text-xs text-purple-600 font-medium">Creator</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleMessage(person)}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-md transition-colors"
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
                )}

                {mentors.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Mentors ({mentors.length})
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
                              <p className="text-xs text-blue-600 font-medium">Mentor</p>
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
                )}

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Students ({students.length})
                  </h2>
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M17 7a3 3 0 11-6 0 3 3 0 016 0zm-6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
                      <p className="text-gray-600">Students who join this course will appear here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map(person => (
                        <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {person.avatar}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{person.name}</h3>
                              <p className="text-sm text-gray-600">{person.year} • {person.major}</p>
                              <p className="text-xs text-green-600 font-medium">Student</p>
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
                  )}
                </div>

                {enrolledUsers.length === 0 && !usersLoading && (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M17 7a3 3 0 11-6 0 3 3 0 016 0zm-6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No one has joined yet</h3>
                    <p className="text-gray-600">Be the first to join this course!</p>
                  </div>
                )}
              </>
            )}
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
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