import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="px-6 py-4 border-b" style={{ backgroundColor: 'white', borderColor: '#e0e0e0' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: '#1a73e8' }}>
            CUNYConnect
          </h1>
          <div className="flex gap-4">
            <Link 
              href="/auth" 
              className="px-4 py-2 rounded-md transition-colors"
              style={{ 
                border: '1px solid #1a73e8',
                color: '#1a73e8'
              }}
            >
              Log In
            </Link>
            <Link 
              href="/auth" 
              className="px-4 py-2 rounded-md transition-colors"
              style={{ 
                backgroundColor: '#1a73e8',
                color: 'white'
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6" style={{ color: '#202124' }}>
            Connect. Collaborate. Succeed Together.
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#5f6368' }}>
            Join the CUNY student community platform where knowledge flows freely. 
            Share resources, get mentorship, and excel in your courses with peer support.
          </p>
          <Link 
            href="/auth" 
            className="inline-block px-8 py-3 rounded-md text-lg font-medium transition-all hover:shadow-lg"
            style={{ 
              backgroundColor: '#1a73e8',
              color: 'white'
            }}
          >
            Get Started with Your CUNY Email
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#202124' }}>
            What is CUNYConnect?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-lg mb-4" style={{ color: '#202124' }}>
                CUNYConnect is a student-driven platform designed to bridge the gap between 
                CUNY students across all campuses. We believe that every student's success 
                contributes to our collective achievement.
              </p>
              <p style={{ color: '#5f6368' }}>
                Whether you're struggling with a challenging course or have valuable insights 
                to share, CUNYConnect provides the space for meaningful academic collaboration.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#e8f0fe' }}
                >
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: '#202124' }}>
                    Verified CUNY Students Only
                  </h4>
                  <p className="text-sm" style={{ color: '#5f6368' }}>
                    Secure platform exclusive to CUNY email holders
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#e8f0fe' }}
                >
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: '#202124' }}>
                    Course-Specific Communities
                  </h4>
                  <p className="text-sm" style={{ color: '#5f6368' }}>
                    Connect with students in your exact courses
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#e8f0fe' }}
                >
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: '#202124' }}>
                    Peer-to-Peer Support
                  </h4>
                  <p className="text-sm" style={{ color: '#5f6368' }}>
                    Get help from students who've already succeeded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#202124' }}>
            Key Features
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}
            >
              <div className="text-3xl mb-4">📚</div>
              <h4 className="text-xl font-semibold mb-3" style={{ color: '#202124' }}>
                Resource Sharing
              </h4>
              <p style={{ color: '#5f6368' }}>
                Upload and access study guides, notes, and course materials. 
                Build a knowledge repository for every CUNY course.
              </p>
            </div>

            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}
            >
              <div className="text-3xl mb-4">💬</div>
              <h4 className="text-xl font-semibold mb-3" style={{ color: '#202124' }}>
                Mentorship Network
              </h4>
              <p style={{ color: '#5f6368' }}>
                Connect directly with students who've completed your courses. 
                Get insider tips, advice, and guidance.
              </p>
            </div>

            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}
            >
              <div className="text-3xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold mb-3" style={{ color: '#202124' }}>
                Course Cohorts
              </h4>
              <p style={{ color: '#5f6368' }}>
                Join dedicated groups for current students and alumni. 
                Collaborate in real-time with your peers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#202124' }}>
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: '#1a73e8', color: 'white' }}
              >
                1
              </div>
              <h4 className="font-semibold mb-2" style={{ color: '#202124' }}>
                Sign Up
              </h4>
              <p className="text-sm" style={{ color: '#BCCCDC' }}>
                Register with your CUNY email address
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: '#1a73e8', color: 'white' }}
              >
                2
              </div>
              <h4 className="font-semibold mb-2" style={{ color: '#202124' }}>
                Select Courses
              </h4>
              <p className="text-sm" style={{ color: '#BCCCDC' }}>
                Add courses you've taken or will take
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: '#1a73e8', color: 'white' }}
              >
                3
              </div>
              <h4 className="font-semibold mb-2" style={{ color: '#202124' }}>
                Join Communities
              </h4>
              <p className="text-sm" style={{ color: '#BCCCDC' }}>
                Connect with course-specific groups
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: '#1a73e8', color: 'white' }}
              >
                4
              </div>
              <h4 className="font-semibold mb-2" style={{ color: '#202124' }}>
                Collaborate
              </h4>
              <p className="text-sm" style={{ color: '#BCCCDC' }}>
                Share, learn, and succeed together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20" style={{ backgroundColor: '#e8f0fe' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4" style={{ color: '#202124' }}>
            Ready to Transform Your Academic Journey?
          </h3>
          <p className="text-lg mb-8" style={{ color: '#5f6368' }}>
            Join thousands of CUNY students already helping each other succeed.
          </p>
          <Link 
            href="/auth" 
            className="inline-block px-8 py-3 rounded-md text-lg font-medium transition-all hover:shadow-lg"
            style={{ 
              backgroundColor: '#1a73e8',
              color: 'white'
            }}
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ backgroundColor: '#202124' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p style={{ color: 'white' }}>
            © 2025 CUNYConnect. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}