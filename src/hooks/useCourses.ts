"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient, Class } from '@/lib/supabaseClient';
import { ClassWithStats } from '@/lib/types/database';

interface UseCoursesReturn {
  courses: ClassWithStats[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCourse: (courseData: Partial<Class>) => Promise<Class | null>;
  deleteCourse: (classId: string) => Promise<boolean>;
  searchAllCourses: (query: string) => Promise<ClassWithStats[]>;
  joinCourse: (classId: string) => Promise<boolean>;
  fetchCoursesByCollege: (collegeName: string) => Promise<ClassWithStats[]>;
}

export function useCourses(userId?: string): UseCoursesReturn {
  const [courses, setCourses] = useState<ClassWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setCourses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabaseClient
        .from('class')
        .select(`
          *,
          user_courses!inner(user_id, role, joined_at)
        `)
        .eq('user_courses.user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const coursesWithStats = await Promise.all(
        (data || []).map(async (course: any) => {
          try {
            const { count: docCount, error: countError } = await supabaseClient
              .from('document')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', course.class_id);

            if (countError) {
              console.warn(`Error getting document count for course ${course.class_id}:`, countError);
            }

            return {
              ...course,
              document_count: docCount || 0,
              member_count: course.student_count || 0,
              user_role: course.user_courses[0]?.role || 'student',
              joined_at: course.user_courses[0]?.joined_at,
            };
          } catch (err) {
            console.warn(`Error processing course ${course.class_id}:`, err);
            return {
              ...course,
              document_count: 0,
              member_count: course.student_count || 0,
              user_role: course.user_courses[0]?.role || 'student',
              joined_at: course.user_courses[0]?.joined_at,
            };
          }
        })
      );

      setCourses(coursesWithStats);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createCourse = async (courseData: Partial<Class>): Promise<Class | null> => {
    setError(null);

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a course');
      }

      const { data, error: createError } = await (supabaseClient
        .from('class') as any)
        .insert({
          college_name: courseData.college_name || '',
          class_subject: courseData.class_subject || '',
          class_number: courseData.class_number || 0,
          created_by: user.id,
          doc_count: 0,
          student_count: 1,
        })
        .select()
        .single();

      if (createError) throw createError;

      const { error: joinError } = await supabaseClient
        .from('user_courses')
        .insert({
          user_id: user.id,
          class_id: data.class_id,
          role: 'owner'
        });

      if (joinError) {
        console.warn('Error adding creator to user_courses:', joinError);
      }

      await fetchCourses();

      return data;
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message || 'Failed to create course');
      return null;
    }
  };

  const deleteCourse = async (classId: string): Promise<boolean> => {
    setError(null);

    try {
      const { error: deleteDocsError } = await supabaseClient
        .from('document')
        .delete()
        .eq('class_id', classId);

      if (deleteDocsError) {
        console.warn('Error deleting course documents:', deleteDocsError);
      }

      const { error: deleteError } = await supabaseClient
        .from('class')
        .delete()
        .eq('class_id', classId);

      if (deleteError) throw deleteError;

      setCourses(prev => prev.filter(course => course.class_id !== classId));

      return true;
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setError(err.message || 'Failed to delete course');
      return false;
    }
  };

  const searchAllCourses = async (query: string): Promise<ClassWithStats[]> => {
    if (!query.trim()) return [];

    try {
      const words = query.trim().split(/\s+/);
      let searchQuery = supabaseClient.from('class').select('*');

      if (words.length === 1) {
        const word = words[0];
        searchQuery = searchQuery.or(`class_subject.ilike.%${word}%,class_number.eq.${isNaN(Number(word)) ? 0 : Number(word)},college_name.ilike.%${word}%`);
      } else if (words.length === 2) {
        const [subject, number] = words;
        const numericNumber = Number(number);
        
        if (!isNaN(numericNumber)) {
          const numberStr = number.toString();
          const digits = numberStr.length;
          const multiplier = Math.pow(10, 3 - digits);
          const minRange = numericNumber * multiplier;
          const maxRange = (numericNumber + 1) * multiplier - 1;
          
          searchQuery = searchQuery
            .ilike('class_subject', `%${subject}%`)
            .gte('class_number', minRange)
            .lte('class_number', maxRange);
        } else {
          searchQuery = searchQuery.or(`class_subject.ilike.%${query}%,college_name.ilike.%${query}%`);
        }
      } else {
        searchQuery = searchQuery.or(`class_subject.ilike.%${query}%,college_name.ilike.%${query}%`);
      }

      const { data, error: searchError } = await searchQuery
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchError) throw searchError;

      const coursesWithStats = await Promise.all(
        (data || []).map(async (course: any) => {
          try {
            const { count: docCount, error: countError } = await supabaseClient
              .from('document')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', course.class_id);

            if (countError) {
              console.warn(`Error getting document count for course ${course.class_id}:`, countError);
            }

            return {
              ...course,
              document_count: docCount || 0,
              member_count: course.student_count || 0,
            };
          } catch (err) {
            console.warn(`Error processing course ${course.class_id}:`, err);
            return {
              ...course,
              document_count: 0,
              member_count: course.student_count || 0,
            };
          }
        })
      );

      return coursesWithStats;
    } catch (err: any) {
      console.error('Error searching courses:', err);
      return [];
    }
  };

  const joinCourse = async (classId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to join a course');
      }

      const { data: existingMembership, error: checkError } = await supabaseClient
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('class_id', classId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingMembership) {
        return true;
      }

      const { error: fetchError } = await supabaseClient
        .from('class')
        .select('*')
        .eq('class_id', classId)
        .single();

      if (fetchError) throw fetchError;

      const { error: joinError } = await supabaseClient
        .from('user_courses')
        .insert({
          user_id: user.id,
          class_id: classId,
          role: 'student'
        });

      if (joinError) throw joinError;

      const { data: currentClass, error: countFetchError } = await supabaseClient
        .from('class')
        .select('student_count')
        .eq('class_id', classId)
        .single();

      if (!countFetchError && currentClass) {
        const currentCount = currentClass.student_count || 0;
        const { error: updateError } = await supabaseClient
          .from('class')
          .update({ student_count: currentCount + 1 })
          .eq('class_id', classId);

        if (updateError) {
          console.warn('Error updating student_count:', updateError);
          }
      }

      await fetchCourses();

      return true;
    } catch (err: any) {
      console.error('Error joining course:', err);
      return false;
    }
  };

  const fetchCoursesByCollege = async (collegeName: string): Promise<ClassWithStats[]> => {
    try {
      const { data, error: fetchError } = await supabaseClient
        .from('class')
        .select('*')
        .eq('college_name', collegeName)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const coursesWithStats = await Promise.all(
        (data || []).map(async (course: any) => {
          try {
            const { count: docCount, error: countError } = await supabaseClient
              .from('document')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', course.class_id);

            if (countError) {
              console.warn(`Error getting document count for course ${course.class_id}:`, countError);
            }

            const { count: memberCount, error: memberError } = await supabaseClient
              .from('user_courses')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', course.class_id);

            if (memberError) {
              console.warn(`Error getting member count for course ${course.class_id}:`, memberError);
            }

            let userRole = null;
            let joinedAt = null;
            
            if (userId) {
              const { data: userEnrollment, error: enrollmentError } = await supabaseClient
                .from('user_courses')
                .select('role, joined_at')
                .eq('class_id', course.class_id)
                .eq('user_id', userId)
                .single();

              if (!enrollmentError && userEnrollment) {
                userRole = userEnrollment.role;
                joinedAt = userEnrollment.joined_at;
              }
            }

            return {
              ...course,
              document_count: docCount || 0,
              member_count: memberCount || 0,
              user_role: userRole,
              joined_at: joinedAt,
            };
          } catch (err) {
            console.warn(`Error processing course ${course.class_id}:`, err);
            return {
              ...course,
              document_count: 0,
              member_count: 0,
              user_role: null,
              joined_at: null,
            };
          }
        })
      );

      return coursesWithStats;
    } catch (err: any) {
      console.error('Error fetching courses by college:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    createCourse,
    deleteCourse,
    searchAllCourses,
    joinCourse,
    fetchCoursesByCollege,
  };
}

export function useCourse(classId: string) {
  const [course, setCourse] = useState<ClassWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabaseClient
          .from('class')
          .select('*')
          .eq('class_id', classId)
          .single();

        if (fetchError) throw fetchError;

        const { count: docCount, error: countError } = await supabaseClient
          .from('document')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classId);

        if (countError) {
          console.warn(`Error getting document count for course ${classId}:`, countError);
        }

        const courseWithStats = {
          ...data,
          document_count: docCount || 0,
          member_count: data.student_count || 0,
        };

        setCourse(courseWithStats);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchCourse();
    }
  }, [classId]);

  return { course, loading, error };
}