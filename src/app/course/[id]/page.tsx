import CourseDetail from "@/components/course/CourseDetail";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return (
    <CourseDetail classId={resolvedParams.id} />
  );
}