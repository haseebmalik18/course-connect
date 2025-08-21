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
}

export function useCourses(userId?: string): UseCoursesReturn {
  const [courses, setCourses] = useState<ClassWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabaseClient
        .from('class')
        .select(`
          *,
          document:document(count)
        `)
        .order('created_at', { ascending: false });

      // Filter by user if userId is provided
      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to include counts
      const coursesWithStats = (data || []).map((course: any) => ({
        ...course,
        document_count: course.document?.[0]?.count || 0,
        member_count: Math.floor(Math.random() * 20) + 5, // Placeholder until we have a members table
      }));

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
      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a course');
      }

      const { data, error: createError } = await supabaseClient
        .from('class')
        .insert({
          college_name: courseData.college_name || '',
          class_subject: courseData.class_subject || '',
          class_number: courseData.class_number || 0,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Refetch courses to update the list
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
      // First, delete all documents associated with this course
      const { error: deleteDocsError } = await supabaseClient
        .from('document')
        .delete()
        .eq('class_id', classId);

      if (deleteDocsError) {
        console.warn('Error deleting course documents:', deleteDocsError);
      }

      // Then delete the course itself
      const { error: deleteError } = await supabaseClient
        .from('class')
        .delete()
        .eq('class_id', classId);

      if (deleteError) throw deleteError;

      // Update local state
      setCourses(prev => prev.filter(course => course.class_id !== classId));

      return true;
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setError(err.message || 'Failed to delete course');
      return false;
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
  };
}

// Hook for fetching a single course
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
          .select(`
            *,
            document:document(count)
          `)
          .eq('class_id', classId)
          .single();

        if (fetchError) throw fetchError;

        const courseWithStats = {
          ...data,
          document_count: data.document?.[0]?.count || 0,
          member_count: Math.floor(Math.random() * 20) + 5,
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