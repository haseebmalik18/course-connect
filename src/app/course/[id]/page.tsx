import CourseDetail from "@/components/course/CourseDetail";

// Sample course data - in production this would come from database
const courseData: Record<string, { code: string; name: string; color: string }> = {
  "1": { code: "BIO 201", name: "Cell Biology", color: "from-green-400 to-green-600" },
  "2": { code: "CHEM 104", name: "General Chemistry II", color: "from-blue-400 to-blue-600" },
  "3": { code: "MATH 150", name: "Calculus I", color: "from-purple-400 to-purple-600" },
  "4": { code: "PHYS 207", name: "General Physics I", color: "from-orange-400 to-orange-600" },
  "5": { code: "CSCI 127", name: "Intro to Computer Science", color: "from-pink-400 to-pink-600" }
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const course = courseData[resolvedParams.id] || courseData["1"]; // Default to BIO 201 if not found

  return (
    <CourseDetail
      courseCode={course.code}
      courseName={course.name}
      courseColor={course.color}
    />
  );
}