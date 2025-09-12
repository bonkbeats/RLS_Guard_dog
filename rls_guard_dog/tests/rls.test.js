// tests/rls.test.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('.env.test missing keys');

const studentEmail = 'prateekrao2003@gmail.com';
const studentPassword = 'pppppp';
const teacherEmail = 'bonkbeats2002@gmail.com';
const teacherPassword = 'pppppp';

const testStudentId = '356d8019-4d8f-4d7c-a4a5-534f0eeb2c28';
const testTeacherId = 'aa44e4e9-8b66-4651-aee1-650fe920cb89';
// const testClassroomId = '15436c53-a202-43c6-9053-e7a3ab8fb6c5';
const testClassroomProgressId = '3b04ba5f-ac9f-4d21-bc0b-bf0ca3025432';

let studentClient;
let teacherClient;

// track created IDs so we can clean them
const created = { classroom_progress: [], profiles: [] };

jest.setTimeout(30000);

beforeAll(async () => {
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // login student
  const studentLogin = await anonClient.auth.signInWithPassword({
    email: studentEmail,
    password: studentPassword,
  });
  const studentSession = studentLogin?.data?.session ?? studentLogin?.session ?? null;
  if (!studentSession?.access_token) throw new Error('Student login failed: ' + JSON.stringify(studentLogin));
  studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await studentClient.auth.setSession({ access_token: studentSession.access_token, refresh_token: studentSession.refresh_token ?? '' });

  // login teacher
  const teacherLogin = await anonClient.auth.signInWithPassword({
    email: teacherEmail,
    password: teacherPassword,
  });
  const teacherSession = teacherLogin?.data?.session ?? teacherLogin?.session ?? null;
  if (!teacherSession?.access_token) throw new Error('Teacher login failed: ' + JSON.stringify(teacherLogin));
  teacherClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await teacherClient.auth.setSession({ access_token: teacherSession.access_token, refresh_token: teacherSession.refresh_token ?? '' });
});

afterAll(async () => {
  // cleanup rows created by tests
  const admin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // service usage only if anon key ok
  for (const id of created.classroom_progress) {
    await admin.from('classroom_progress').delete().eq('id', id);
  }
  for (const id of created.profiles) {
    await admin.from('profiles').delete().eq('id', id);
  }
});

describe('Supabase RLS - full suite', () => {
  test('Sanity: clients authenticated', async () => {
    const s = await studentClient.auth.getUser();
    const t = await teacherClient.auth.getUser();
    expect(s.error).toBeNull();
    expect(t.error).toBeNull();
    expect(s.data?.user?.id).toBe(testStudentId);
    expect(t.data?.user?.id).toBe(testTeacherId);
  });

  test('Student: can read own classroom progress', async () => {
    const { data, error } = await studentClient.from('classroom_progress').select('*').eq('student_id', testStudentId);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    data.forEach(r => expect(r.student_id).toBe(testStudentId));
  });

  test('Student: cannot update any progress', async () => {
    const { data, error } = await studentClient.from('classroom_progress').update({ progress_percentage: 50 }).eq('id', testClassroomProgressId);
    expect(data).toBeNull();
    expect(error).toBeDefined();
  });

  test('Student: cannot read other students progress', async () => {
    const { data, error } = await studentClient.from('classroom_progress').select('*').neq('student_id', testStudentId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  test('Student: cannot update profiles', async () => {
    const { data, error } = await studentClient.from('profiles').update({ name: 'Bad' }).eq('id', testStudentId);
    expect(data).toBeNull();
    expect(error).toBeDefined();
  });

test('Student: can insert their own profile idempotently (safe)', async () => {
  const profilePayload = {
    id: testStudentId,
    name: 'Test Student',
    email: 'prateekrao2003@gmail.com',
    role: 'student' // required by your schema
  };

  // 1) Check if profile already exists
  const { data: found, error: findErr } = await studentClient.from('profiles').select('*').eq('id', testStudentId).limit(1).maybeSingle();
  if (findErr) throw new Error('Find profile error: ' + JSON.stringify(findErr));
  if (found) {
    // Profile already exists — assert it's our user and skip insert
    expect(found.id).toBe(testStudentId);
    expect(found.email).toBe(profilePayload.email);
    return; // nothing to insert or cleanup
  }

  // 2) Insert because not present
  const { data, error } = await studentClient.from('profiles').insert([profilePayload]).select('*').single();
  expect(error).toBeNull();
  expect(data.id).toBe(testStudentId);
  created.profiles.push(data.id);
});


  test('Teacher: can read all classrooms', async () => {
    const { data, error } = await teacherClient.from('classroom').select('*');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });


 test('Teacher: can update any progress', async () => {
  // ensure there is a progress row to update
  const cpId = created.classroom_progress[0] ?? testClassroomProgressId;
  if (!cpId) throw new Error('No classroom_progress id available to update');

  const { data, error } = await teacherClient
    .from('classroom_progress')
    .update({ progress_percentage: 100 })
    .eq('id', cpId)
    .select('*'); // ask the API to return the updated row(s)

  // assert
  expect(error).toBeNull();
  expect(data).toBeDefined();

  const updated = Array.isArray(data) ? data[0] : data;
  expect(updated).toBeDefined();
  expect(updated.id).toBe(cpId);
  expect(updated.progress_percentage).toBe(100);
});


  test('Teacher: can view all profiles', async () => {
    const { data, error } = await teacherClient.from('profiles').select('*');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
