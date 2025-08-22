# CourseConnect 🎓

A modern, collaborative learning platform designed specifically for CUNY students to connect, share resources, and study together.

**🌐 Live Platform**: https://course-connect-ashy.vercel.app/

## 🌟 Features

### 📚 Course Management
- **Create & Join Courses**: Easily create new courses or join existing ones
- **Course Discovery**: Search and browse courses across different CUNY colleges
- **Smart Search**: Find courses by subject, number, or college name
- **Role-Based Access**: Support for course owners, mentors, and students

### 📁 Document Sharing
- **File Upload**: Upload study materials, notes, and resources
- **Multiple Formats**: Support for PDFs, documents, presentations, images, and more
- **Organized Storage**: Automatic categorization and easy access to course materials
- **Download & Share**: Simple file sharing between course members

### 👥 Community Features
- **Study Groups**: Connect with peers taking the same courses
- **Mentor System**: Find students who have already completed the course
- **Real-time Chat**: Built-in messaging system for course discussions
- **Profile Management**: Customizable user profiles with academic information

### 🔐 Authentication & Security
- **CUNY Email Verification**: Secure authentication using CUNY email addresses
- **Automatic Name Extraction**: Smart parsing of names from CUNY email format
- **Row Level Security**: Database-level security for user data
- **Protected Routes**: Secure access to course content and user data

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React state management

### Backend & Database
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Robust relational database
- **Real-time Subscriptions** - Live updates for chat and notifications
- **Row Level Security (RLS)** - Database-level security

### Authentication
- **Supabase Auth** - Secure user authentication
- **CUNY Email Validation** - Domain-specific email verification
- **Automatic Profile Creation** - Smart user onboarding

## 🎯 How to Use

### 🆕 Getting Started
1. **Visit the Platform**: Go to [Your deployed URL]
2. **Sign Up**: Use your CUNY email address (e.g., `john.doe90@myhunter.cuny.edu`)
3. **Get Started**: Your name will be automatically extracted from your email
4. **Explore Courses**: Browse existing courses or create your own

### 📚 For Students
1. **Join Courses**: Find and join courses you're currently taking
2. **Access Materials**: Download study materials shared by peers and mentors
3. **Connect**: Chat with classmates and find study partners
4. **Share**: Upload your own notes and resources

### 🎓 For Course Creators
1. **Create Courses**: Set up new courses with subject, number, and college
2. **Manage Content**: Upload and organize course materials
3. **Monitor Activity**: Track document uploads and member engagement
4. **Foster Community**: Encourage collaboration and resource sharing

### 👨‍🏫 For Mentors
1. **Share Experience**: Help students who are currently taking courses you've completed
2. **Provide Resources**: Upload study guides, notes, and exam materials
3. **Answer Questions**: Support students through the chat system
4. **Build Network**: Connect with other mentors and expand your academic network

## 🔧 Platform Features

### Email Validation
The platform automatically validates CUNY email addresses and extracts user names:
- **Format**: `first_name.last_name<number>@cuny.id`
- **Example**: `john.doe90@myhunter.cuny.edu`
- **Extracted**: First Name: "John", Last Name: "Doe"

### File Upload
- **Maximum file size**: 50MB
- **Supported formats**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, GIF
- **Storage**: Files are automatically organized by course

### Security Features
- **CUNY Email Only**: Only CUNY students can access the platform
- **Course Privacy**: Users can only see content for courses they're enrolled in
- **Secure File Sharing**: Documents are protected and only accessible to course members

## 🌐 Platform Access

### Web Application
- **URL**: [Your deployed URL]
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: Responsive design for mobile devices

### System Requirements
- **Internet Connection**: Required for real-time features
- **Modern Browser**: JavaScript enabled
- **File Upload**: Support for various document formats

## 🤝 Community Guidelines

### Be Respectful
- Treat all users with respect and kindness
- No harassment, bullying, or inappropriate content
- Maintain academic integrity

### Share Responsibly
- Only upload materials you have permission to share
- Respect copyright and intellectual property
- Help maintain a positive learning environment

### Collaborate Effectively
- Engage in meaningful discussions
- Share helpful resources and insights
- Support your fellow students

## 📞 Support & Feedback

### Getting Help
- **Platform Issues**: Report bugs or technical problems
- **Feature Requests**: Suggest new features or improvements
- **General Questions**: Ask about platform usage

### Contact Information
- **GitHub Issues**: [Create an issue](https://github.com/faikarf3/course-connect/issues)
- **Email**: [Your contact email]
- **Response Time**: We aim to respond within 24-48 hours

## 🔮 Future Features

We're constantly improving CourseConnect! Upcoming features include:
- **Mobile App**: Native iOS and Android applications
- **Advanced Search**: More sophisticated course and material discovery
- **Study Analytics**: Track your learning progress and engagement
- **Integration**: Connect with other CUNY platforms and services
- **Notifications**: Real-time alerts for new materials and messages

## 🙏 Acknowledgments

- **CUNY Community** - For inspiring this collaborative learning platform
- **Supabase** - For providing an excellent open-source backend solution
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Early Users** - For feedback and suggestions that shape the platform

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for CUNY students by CUNY students**

**🌐 Visit**: https://course-connect-ashy.vercel.app/  
**🐛 Report Issues**: [GitHub Issues](https://github.com/faikarf3/course-connect)
