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
          const firstTest = tests[0] || null;
          setSelectedTest(firstTest?.value || '');

          if (firstTest) {
            const allResults = await apiRequest(`/tests/${firstTest.value}/results`);
            if (isMounted) setSubmissions(allResults);
          } else {
            if (isMounted) setSubmissions([]);
          }
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

    apiRequest(`/tests/${selectedTest}/results`)
      .then((results) => setSubmissions(results))
      .catch((error) => setLoadError(error.message || 'Unable to load results.'));
  }, [selectedTest]);

  const visibleSubmissions = submissions
    .filter((submission) => !selectedTest || String(submission.testId) === String(selectedTest))
    .sort((left, right) => right.score - left.score || new Date(left.submittedAt) - new Date(right.submittedAt));

  const leaderboardRows = visibleSubmissions.map((submission, index) => ({
    ...submission,
    studentName: submission.studentName || submission.username,
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
      <header className="sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => navigate(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-sm">analytics</span>
              </div>
              <span className="text-xl font-black tracking-tight text-[#0b1c30]">QuizFlow</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <a className="text-slate-500 hover:text-indigo-600 text-sm font-semibold cursor-pointer transition-colors" onClick={() => navigate(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}>Dashboard</a>
              <a className="text-indigo-600 border-b-2 border-indigo-600 pb-1 text-sm font-bold cursor-pointer">Leaderboard</a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all relative">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
            <div className="flex items-center gap-3 ml-1 sm:ml-2 pl-3 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-[11px] font-black text-[#0b1c30] leading-tight">{currentUserName}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{userRole}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 overflow-hidden shadow-sm ring-2 ring-indigo-50">
                <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPgaEX2t9HauQ0yhbFuw7tsAqkUepjxjgPTIHDO0aeELw3P9c57J_F7oKuvZYxe4XJKr90qmwUN5eob2hGAdgS5rWdwlFpYdUaQak4-5g607v3s0zpsW7m_Mf9DZXzaJikQWNYhWYfbhOPYkUle9UKPYD1n0q8R7_5qjQlVtXMYX7r0fv918X5nIc4ryyyA4HaKU0Lv_L-jkEK5EhhQlCf9lCP0rxmn_-hnELjze4eDnEwVi35V9Qk_ZciRbp3ghnSaCJTojH9lcz1" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Hero Section & Filters */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1f108e]">Academic Standings</h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl">Visualizing student performance and ranking for the selected assessment.</p>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-80 shrink-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filter by Assessment</label>
            <div className="flex gap-2">
              <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="flex-grow bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 py-3 px-4 focus:outline-none shadow-sm transition-all cursor-pointer">
                {availableTests.map((test) => (
                  <option key={test.value} value={test.value}>{test.label}</option>
                ))}
              </select>
              <button className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-all active:scale-95 shrink-0">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>
        </section>

        {/* Podium / Bento Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-medium">
              Loading rankings...
            </div>
          ) : loadError ? (
            <div className="lg:col-span-3 bg-white border border-red-100 rounded-3xl p-12 text-center text-red-500 font-medium">
              {loadError}
            </div>
          ) : topThree.length > 0 ? (
            topThree.map((submission, index) => {
              const badgeStyles = [
                { wrapper: 'lg:order-2 bg-gradient-to-b from-indigo-50 to-white border-2 border-indigo-200 p-8 shadow-xl lg:scale-105 z-10', rank: 'bg-yellow-400 text-yellow-900 w-12 h-12 border-4 border-white shadow-lg', label: 'Highest Performance', icon: 'military_tech' },
                { wrapper: 'lg:order-1 bg-white border border-slate-100 p-6 shadow-md', rank: 'bg-slate-300 text-slate-800 w-10 h-10 border-4 border-white shadow-md', label: 'Top 5% Student', icon: 'workspace_premium' },
                { wrapper: 'lg:order-3 bg-white border border-slate-100 p-6 shadow-md', rank: 'bg-orange-300 text-orange-900 w-10 h-10 border-4 border-white shadow-md', label: 'Top 10% Student', icon: 'stars' },
              ][index];
              const avatarSize = index === 0 ? 'w-28 h-28' : 'w-24 h-24';

              return (
                <div key={submission.id} className={`${badgeStyles.wrapper} rounded-[2rem] flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-all duration-300`}>
                  <div className="relative mb-6">
                    <div className={`${avatarSize} rounded-[2rem] overflow-hidden border-4 border-white bg-slate-100 flex items-center justify-center shadow-inner`}>
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                    <span className={`absolute -bottom-3 -right-3 rounded-2xl flex items-center justify-center font-black text-lg ${badgeStyles.rank}`}>{submission.rank}</span>
                  </div>
                  <h2 className={`${index === 0 ? 'text-2xl font-black text-[#1f108e]' : 'text-xl font-bold text-[#0b1c30]'} leading-tight`}>{submission.studentName}</h2>
                  <p className={`${index === 0 ? 'text-xl font-black text-indigo-600 mt-1' : 'text-base font-bold text-teal-600 mt-1'} mb-6`}>{submission.scoreText} Score</p>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{badgeStyles.icon}</span>
                    {badgeStyles.label}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-medium italic">
              No submissions yet. Rankings will appear here.
            </div>
          )}
        </section>

        {/* Leaderboard Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30]">Class Leaderboard</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                <span className="material-symbols-outlined text-base">download</span>
                Export
              </button>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all" onClick={() => window.location.reload()}>
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Rank</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Student Name</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Score</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Performance</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaderboardRows.length > 0 ? (
                  leaderboardRows.map((submission) => (
                    <tr key={submission.id} className={`hover:bg-indigo-50/20 transition-colors group ${currentUserSubmission?.id === submission.id ? 'bg-indigo-50/40' : ''}`}>
                      <td className="px-6 py-5">
                        <span className={`${submission.rank === 1 ? 'bg-yellow-400 text-yellow-900' : submission.rank === 2 ? 'bg-slate-300 text-slate-800' : submission.rank === 3 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-500'} w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm`}>{submission.rank}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 shadow-sm">
                            <span className="material-symbols-outlined text-xl">person</span>
                          </div>
                          <div>
                            <p className="font-bold text-[#0b1c30]">{submission.studentName}</p>
                            {currentUserSubmission?.id === submission.id && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-base font-black text-indigo-700">{submission.scoreText}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-grow w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: submission.percentText }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-500 w-8">{submission.percentText}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400 text-xs font-medium">{submission.submittedText}</td>
                      <td className="px-6 py-5 text-right">
                        {(userRole === 'teacher' || submission.username === currentUserIdentifier) && (
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                            onClick={() => navigate('/results', { state: { submission } })}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-400 font-medium" colSpan="6 italic">
                      No results found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Leaderboard View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {leaderboardRows.length > 0 ? (
              leaderboardRows.map((submission) => (
                <div key={submission.id} className={`p-5 space-y-4 hover:bg-slate-50 transition-colors ${currentUserSubmission?.id === submission.id ? 'bg-indigo-50/30 ring-inset ring-2 ring-indigo-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`${submission.rank === 1 ? 'bg-yellow-400 text-yellow-900' : submission.rank === 2 ? 'bg-slate-300 text-slate-800' : submission.rank === 3 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-500'} w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-sm shrink-0`}>
                        {submission.rank}
                      </span>
                      <div>
                        <p className="font-black text-[#0b1c30] leading-tight text-lg">{submission.studentName}</p>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mt-0.5">{submission.submittedText}</p>
                      </div>
                    </div>
                    {currentUserSubmission?.id === submission.id && (
                      <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">You</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Score</p>
                      <p className="text-xl font-black text-indigo-700 leading-none">{submission.scoreText}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Percentage</p>
                      <p className="text-xl font-black text-teal-600 leading-none">{submission.percentText}</p>
                    </div>
                  </div>

                  {(userRole === 'teacher' || submission.username === currentUserIdentifier) && (
                    <button
                      className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-2xl active:scale-95 transition-all"
                      onClick={() => navigate('/results', { state: { submission } })}
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      View Detailed Performance
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium italic">
                No submissions found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
