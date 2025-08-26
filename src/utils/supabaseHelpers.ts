import { supabaseClient, Class, Document } from '@/lib/supabaseClient';
import { ClassWithStats, DocumentWithUser } from '@/lib/types/database';


export async function getCourses(options?: {
  userId?: string;
  college?: string;
  subject?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: ClassWithStats[]; error: Error | null }> {
  try {
    let query = (supabaseClient
      .from('class') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.userId) {
      query = query.eq('created_by', options.userId);
    }
    if (options?.college) {
      query = query.eq('college_name', options.college);
    }
    if (options?.subject) {
      query = query.eq('class_subject', options.subject);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: courses, error } = await query;

    if (error) throw error;

    const coursesWithStats = await Promise.all(
      (courses || []).map(async (course: any) => {
        try {
          const { count: docCount, error: countError } = await supabaseClient
            .from('document')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', course.class_id);

          if (countError) {
            // Ignore count error for now
          }

          const { count: memberCount, error: memberError } = await supabaseClient
            .from('user_courses')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', course.class_id);

          if (memberError) {
            // Ignore member count error for now
          }

          return {
            ...course,
            document_count: docCount || 0,
            member_count: memberCount || 0,
          };
        } catch (err) {
          // Ignore processing error for now
          return {
            ...course,
            document_count: 0,
            member_count: 0,
          };
        }
      })
    );

    return { data: coursesWithStats, error: null };
  } catch (error: any) {
    // Error in getCourses
    return { data: [], error };
  }
}

export async function getCourseById(
  classId: string
): Promise<{ data: ClassWithStats | null; error: Error | null }> {
  try {
    const { data: course, error } = await (supabaseClient
      .from('class') as any)
      .select('*')
      .eq('class_id', classId)
      .single();

    if (error) throw error;

    const { count: docCount, error: countError } = await supabaseClient
      .from('document')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId);

    if (countError) {
      // Ignore count error for now
    }

    const { count: memberCount, error: memberError } = await supabaseClient
      .from('user_courses')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId);

    if (memberError) {
      // Ignore member count error for now
    }

    const courseWithStats = {
      ...course,
      document_count: docCount || 0,
      member_count: memberCount || 0,
    };

    return { data: courseWithStats, error: null };
  } catch (error: any) {
    // Error in getCourseById
    return { data: null, error };
  }
}

export async function createCourse(courseData: {
  college_name: string;
  class_subject: string;
  class_number: number;
}): Promise<{ data: Class | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a course');
    }

    const { data, error } = await (supabaseClient
      .from('class') as any)
      .insert({
        ...courseData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    // Error in createCourse
    return { data: null, error };
  }
}

export async function updateCourse(
  classId: string,
  updates: Partial<Pick<Class, 'college_name' | 'class_subject' | 'class_number'>>
): Promise<{ data: Class | null; error: Error | null }> {
  try {
    const { data, error } = await (supabaseClient
      .from('class') as any)
      .update(updates)
      .eq('class_id', classId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    // Error in updateCourse
    return { data: null, error };
  }
}

export async function deleteCourse(
  classId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error: docsError } = await (supabaseClient
      .from('document') as any)
      .delete()
      .eq('class_id', classId);

    if (docsError) {
      // Ignore document deletion error for now
    }

    const { error } = await (supabaseClient
      .from('class') as any)
      .delete()
      .eq('class_id', classId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    // Error in deleteCourse
    return { success: false, error };
  }
}


export async function getDocumentsByClass(
  classId: string
): Promise<{ data: DocumentWithUser[]; error: Error | null }> {
  try {
    const { data, error } = await (supabaseClient
      .from('document') as any)
      .select('doc_id, class_id, doc_path, doc_type, doc_name, created_by, created_at')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const docsWithUsers = (data || []).map((doc: any) => ({
      ...doc,
      user: {
        full_name: `User ${doc.created_by.slice(0, 8)}`,
        email: `user@cuny.edu`,
      },
    }));

    return { data: docsWithUsers, error: null };
  } catch (error: any) {
    // Error in getDocumentsByClass
    return { data: [], error };
  }
}

export async function uploadDocument(
  file: File,
  classId: string,
  docName: string,
  metadata?: {
    description?: string;
  }
): Promise<{ data: Document | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to upload documents');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${classId}/${user.id}/${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseClient.storage
      .from('documents')
      .getPublicUrl(fileName);

    const docType = getDocumentType(file.name);

    const { data, error } = await (supabaseClient
      .from('document') as any)
      .insert({
        class_id: classId,
        doc_path: publicUrl,
        doc_type: docType,
        doc_name: docName,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    try {
      const { data: currentClass, error: fetchError } = await (supabaseClient
        .from('class') as any)
        .select('doc_count')
        .eq('class_id', classId)
        .single();

      if (!fetchError && currentClass) {
        const currentCount = currentClass.doc_count || 0;
        const newCount = currentCount + 1;
        
        const { error: updateError } = await (supabaseClient
          .from('class') as any)
          .update({ doc_count: newCount })
          .eq('class_id', classId);

        if (updateError) {
          // Ignore doc count update error
        }
      }
    } catch (countError) {
      // Ignore count update error
    }

    return { data, error: null };
  } catch (error: any) {
    // Error in uploadDocument
    return { data: null, error };
  }
}

export async function deleteDocument(
  docId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data: doc, error: fetchError } = await (supabaseClient
      .from('document') as any)
      .select('doc_path')
      .eq('doc_id', docId)
      .single();

    if (fetchError) throw fetchError;

    if (doc?.doc_path?.includes('storage')) {
      const pathMatch = doc.doc_path.match(/documents\/(.+)$/);
      if (pathMatch) {
        const { error: storageError } = await supabaseClient.storage
          .from('documents')
          .remove([pathMatch[1]]);

        if (storageError) {
          // Ignore storage deletion error
        }
      }
    }

    const { error } = await (supabaseClient
      .from('document') as any)
      .delete()
      .eq('doc_id', docId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    // Error in deleteDocument
    return { success: false, error };
  }
}

export function downloadDocument(docPath: string, fileName: string): void {
  try {
    if (docPath.includes('storage')) {
      const link = document.createElement('a');
      link.href = docPath;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(docPath, '_blank');
    }
  } catch (error: any) {
    // Error downloading document
  }
}


function getDocumentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    pdf: 'pdf',
    doc: 'document',
    docx: 'document',
    txt: 'document',
    ppt: 'presentation',
    pptx: 'presentation',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    svg: 'image',
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
  };

  return typeMap[ext || ''] || 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

export async function getEnrolledUsers(
  classId: string
): Promise<{ data: any[]; error: Error | null }> {
  try {
    const { data: userCourses, error: userCoursesError } = await (supabaseClient
      .from('user_courses') as any)
      .select('*')
      .eq('class_id', classId)
      .order('joined_at', { ascending: true });

    if (userCoursesError) throw userCoursesError;

    if (!userCourses || userCourses.length === 0) {
      return { data: [], error: null };
    }

    const userIds = userCourses.map((uc: any) => uc.user_id);
    const { data: profiles } = await (supabaseClient
      .from('profiles') as any)
      .select('*')
      .in('id', userIds);

    const profileMap = new Map();
    profiles?.forEach((profile: any) => {
      profileMap.set(profile.id, profile);
    });

    const enrolledUsers = userCourses.map((enrollment: any) => {
      const profile = profileMap.get(enrollment.user_id);
      const fullName = profile?.full_name || `User ${enrollment.user_id.slice(0, 8)}`;
      
      return {
        id: enrollment.user_id,
        name: fullName,
        email: profile?.email || 'unknown@cuny.edu',
        major: profile?.major || 'Unknown',
        year: profile?.year || 'Unknown',
        college: profile?.college || 'CUNY',
        role: enrollment.role,
        joined_at: enrollment.joined_at,
        avatar: fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      };
    });

    return { data: enrolledUsers, error: null };
  } catch (error: any) {
    return { data: [], error };
  }
}

export function isValidCunyEmail(email: string): boolean {
  const cunyDomains = [
    'cuny.edu',
    'baruch.cuny.edu',
    'brooklyn.cuny.edu',
    'ccny.cuny.edu',
    'hunter.cuny.edu',
    'jjay.cuny.edu',
    'lehman.cuny.edu',
    'qc.cuny.edu',
    'csi.cuny.edu',
    'york.cuny.edu',
    'citytech.cuny.edu',
    'medgar.cuny.edu',
    'bcc.cuny.edu',
    'bmcc.cuny.edu',
    'guttman.cuny.edu',
    'hostos.cuny.edu',
    'kbcc.cuny.edu',
    'lagcc.cuny.edu',
    'qcc.cuny.edu',
    'bcmail.cuny.edu',
    'myhunter.cuny.edu',
    'citymail.cuny.edu',
  ];

  const emailDomain = email.toLowerCase().split('@')[1];
  return cunyDomains.includes(emailDomain);
}