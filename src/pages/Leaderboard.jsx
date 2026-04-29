import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getStoredUser } from '../config/api';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('student');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserIdentifier, setCurrentUserIdentifier] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setUserRole(user.role);
    setCurrentUserName(user.name || user.identifier || 'User');
    setCurrentUserIdentifier(user.identifier || '');

    let isMounted = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      setLoadError('');

      try {
        if (user.role === 'teacher') {
          const teacherTests = await apiRequest('/tests/my-tests');
          const tests = teacherTests.map((test) => ({
            value: String(test.id),
            label: test.testName,
          }));

          if (!isMounted) return;

          setAvailableTests(tests);
          const firstTest = tests[0] || null;
          setSelectedTest(firstTest?.value || '');

          if (firstTest) {
            const results = await apiRequest(`/tests/${firstTest.value}/results`);
            if (isMounted) setSubmissions(results);
          } else {
            if (isMounted) setSubmissions([]);
          }
        } else {
          const results = await apiRequest('/tests/results/my-results');
          const tests = Array.from(
            new Map(results.map((result) => [String(result.testId), result.testName || `Test ${result.testId}`])).entries()
          ).map(([value, label]) => ({ value, label }));

          if (!isMounted) return;

          setAvailableTests(tests);
          setSelectedTest(tests[0]?.value || '');
          setSubmissions(results);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Unable to load leaderboard.');
          setSubmissions([]);
          setAvailableTests([]);
          setSelectedTest('');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!selectedTest) return;

    if (userRole === 'teacher') {
      apiRequest(`/tests/${selectedTest}/results`)
        .then((results) => setSubmissions(results))
        .catch((error) => setLoadError(error.message || 'Unable to load results.'));
    }
  }, [selectedTest, userRole]);

  const visibleSubmissions = submissions
    .filter((submission) => !selectedTest || String(submission.testId) === String(selectedTest))
    .filter((submission) => userRole === 'teacher' || submission.username === currentUserIdentifier)
    .sort((left, right) => right.score - left.score || new Date(left.submittedAt) - new Date(right.submittedAt));

  const leaderboardRows = visibleSubmissions.map((submission, index) => ({
    ...submission,
    studentName: submission.username,
    rank: index + 1,
    scoreText: `${submission.score}/${submission.total}`,
    percentText: `${submission.total > 0 ? Math.round((submission.score / submission.total) * 100) : 0}%`,
    submittedText: new Date(submission.submittedAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  const topThree = leaderboardRows.slice(0, 3);
  const currentUserSubmission = leaderboardRows.find((row) => row.username === currentUserIdentifier);

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen antialiased">
      {/* TopAppBar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 w-full z-50 h-16 flex items-center">
        <nav className="sticky top-0 w-full flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-indigo-700">QuizFlow</span>
            <div className="hidden md:flex gap-6">
              <a 
                className="text-slate-600 hover:text-indigo-500 text-sm font-semibold transition-colors duration-200 cursor-pointer" 
                onClick={() => navigate(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}
              >
                Dashboard
              </a>
              <a className="text-indigo-600 border-b-2 border-indigo-600 pb-1 text-sm font-semibold">Leaderboard</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 transition-colors duration-200 hover:bg-slate-50 rounded-full active:scale-95 duration-150">
              <span className="material-symbols-outlined text-slate-600">notifications</span>
            </button>
            <button className="p-2 transition-colors duration-200 hover:bg-slate-50 rounded-full active:scale-95 duration-150">
              <span className="material-symbols-outlined text-slate-600">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPgaEX2t9HauQ0yhbFuw7tsAqkUepjxjgPTIHDO0aeELw3P9c57J_F7oKuvZYxe4XJKr90qmwUN5eob2hGAdgS5rWdwlFpYdUaQak4-5g607v3s0zpsW7m_Mf9DZXzaJikQWNYhWYfbhOPYkUle9UKPYD1n0q8R7_5qjQlVtXMYX7r0fv918X5nIc4ryyyA4HaKU0Lv_L-jkEK5EhhQlCf9lCP0rxmn_-hnELjze4eDnEwVi35V9Qk_ZciRbp3ghnSaCJTojH9lcz1" />
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section & Filters */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8">
            <h1 className="text-3xl font-bold text-[#1f108e] mb-2">Academic Standings</h1>
            <p className="text-lg text-[#464553] max-w-2xl">Visualizing student performance for the selected assessment.</p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#464553]">Filter by Assessment</label>
            <div className="flex gap-2">
              <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="flex-grow bg-slate-100 border-none rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary py-3 px-4 focus:outline-none">
                {availableTests.map((test) => (
                  <option key={test.value} value={test.value}>{test.label}</option>
                ))}
              </select>
              <button className="bg-[#1f108e] text-white px-4 rounded-lg hover:opacity-90 transition-all active:scale-95">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>
        </section>

        {/* Podium / Bento Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              Loading leaderboard from Supabase...
            </div>
          ) : loadError ? (
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              {loadError}
            </div>
          ) : topThree.length > 0 ? (
            topThree.map((submission, index) => {
              const badgeStyles = [
                { wrapper: 'order-1 md:order-2 bg-indigo-50 border-2 border-indigo-200 p-8 shadow-md md:scale-105 z-10', rank: 'bg-yellow-400 text-yellow-900 w-10 h-10 border-4 border-white shadow-md', label: 'Highest Performance' },
                { wrapper: 'order-2 md:order-1 bg-white border border-slate-200 p-6 shadow-sm', rank: 'bg-slate-300 text-slate-800 w-8 h-8 border-2 border-white shadow-sm', label: 'Top 5% Student' },
                { wrapper: 'order-3 md:order-3 bg-white border border-slate-200 p-6 shadow-sm', rank: 'bg-orange-300 text-orange-900 w-8 h-8 border-2 border-white shadow-sm', label: 'Top 10% Student' },
              ][index];
              const avatarSize = index === 0 ? 'w-24 h-24' : 'w-20 h-20';

              return (
                <div key={submission.id} className={`${badgeStyles.wrapper} rounded-xl flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-200`}>
                  <div className="relative mb-4">
                    <div className={`${avatarSize} rounded-full overflow-hidden border-4 border-slate-200 bg-slate-100 flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-slate-400">person</span>
                    </div>
                    <span className={`absolute -bottom-2 -right-2 rounded-full flex items-center justify-center font-bold ${badgeStyles.rank}`}>{submission.rank}</span>
                  </div>
                  <h2 className={`${index === 0 ? 'text-2xl font-bold text-[#1f108e]' : 'text-xl font-semibold text-[#0b1c30]'}`}>{submission.studentName}</h2>
                  <p className={`${index === 0 ? 'text-xl font-semibold text-indigo-700' : 'text-sm font-semibold text-[#006a61]'} mb-4`}>{submission.scoreText} Score</p>
                  <div className="bg-slate-100 px-4 py-1 rounded-full text-xs text-[#464553]">{badgeStyles.label}</div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              No student submissions yet for this test.
            </div>
          )}
        </section>

        {/* Leaderboard Table */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-bold text-[#0b1c30]">Class Leaderboard</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <span className="material-symbols-outlined">download</span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" onClick={() => window.location.reload()}>
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-[#464553]">Rank</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#464553]">Student Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#464553]">Score</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#464553]">Percentage</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#464553]">Submission Timestamp</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#464553] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboardRows.length > 0 ? (
                  leaderboardRows.map((submission) => (
                    <tr key={submission.id} className={`hover:bg-slate-50 transition-colors ${currentUserSubmission && currentUserSubmission.id === submission.id ? 'bg-indigo-500/5 border-l-4 border-l-[#1f108e] hover:bg-indigo-500/10' : ''}`}>
                      <td className="px-6 py-4">
                        <span className={`${submission.rank === 1 ? 'bg-yellow-100 text-yellow-700' : submission.rank === 2 ? 'bg-slate-100 text-slate-600' : submission.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>{submission.rank}</span>
                      </td>
                      <td className="px-6 py-4 text-xl font-semibold text-[#0b1c30] flex items-center gap-2">
                        {submission.studentName}
                        {currentUserSubmission && currentUserSubmission.id === submission.id && userRole !== 'teacher' && (
                          <span className="bg-[#e2dfff] text-[#0f0069] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Current</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-base text-[#1f108e]">{submission.scoreText}</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#86f2e4] text-[#006f66] px-3 py-1 rounded-full text-xs font-bold">{submission.percentText}</span>
                      </td>
                      <td className="px-6 py-4 text-[#464553] text-xs">{submission.submittedText}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:underline text-sm font-semibold" onClick={() => navigate('/results')}>View Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-10 text-center text-slate-500" colSpan="6">
                      No student submissions found for the selected test.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
