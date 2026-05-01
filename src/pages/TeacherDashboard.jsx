import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, clearAuthSession, getStoredUser } from '../config/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacherUser, setTeacherUser] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadError, setLoadError] = useState('');

  const mapTestToCard = (test, questionCount = 0) => ({
    id: test.id,
    name: test.testName,
    unit: test.published === 'yes' ? 'Published assessment' : 'Draft assessment',
    duration: `${test.duration} min`,
    date: test.publishedAt 
      ? new Date(test.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
      : (test.published === 'yes' ? 'Published' : 'Draft'),
    status: test.published === 'yes' ? 'Active' : 'Draft',
    code: (test.testName || 'TX').slice(0, 2).toUpperCase(),
    passcode: test.passcode || '',
    ownerIdentifier: test.teacherUsername,
    ownerName: teacherName || test.teacherUsername,
    questions: Array.from({ length: questionCount }, () => ({})),
    durationSeconds: Number(test.duration) * 60,
    questionCount,
  });

  const filteredTests = tests.filter((test) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return [test.name, test.unit, test.status, test.code, test.duration, test.date]
      .some((value) => value.toLowerCase().includes(query));
  });

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'teacher') {
      navigate('/login');
    } else {
      setTeacherUser(user);
      setTeacherName(user.name);
    }
  }, [navigate]);

  useEffect(() => {
    if (!teacherUser) return;
    let isMounted = true;

    const loadTests = async () => {
      setLoadingTests(true);
      setLoadError('');

      try {
        const backendTests = await apiRequest('/tests/my-tests');
        const testsWithQuestions = await Promise.all(
          backendTests.map(async (test) => {
            const questions = await apiRequest(`/questions/test/${test.id}`);
            return mapTestToCard(test, questions.length);
          })
        );

        if (isMounted) {
          setTests(testsWithQuestions);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Unable to load tests.');
          setTests([]);
        }
      } finally {
        if (isMounted) {
          setLoadingTests(false);
        }
      }
    };

    loadTests();

    return () => {
      isMounted = false;
    };
  }, [teacherUser]);

  const logout = () => {
    clearAuthSession();
    navigate('/login');
  };
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestPasscode, setNewTestPasscode] = useState('');
  const [newTestDuration, setNewTestDuration] = useState('60');
  const [createError, setCreateError] = useState('');

  const createQuiz = () => {
    setNewTestName('');
    setNewTestPasscode('');
    setNewTestDuration('60');
    setCreateError('');
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreateError('');
  };

  const submitCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newTestName.trim()) {
      setCreateError('Please enter a test name.');
      return;
    }
    const seconds = parseInt(newTestDuration, 10);
    if (Number.isNaN(seconds) || seconds <= 0) {
      setCreateError('Duration must be a positive number of minutes.');
      return;
    }

    try {
      await apiRequest('/tests/create', {
        method: 'POST',
        body: {
          testName: newTestName.trim(),
          passcode: newTestPasscode,
          teacherUsername: teacherUser?.identifier,
          duration: seconds,
          published: 'no',
        },
      });

      setIsCreateDialogOpen(false);
      await apiRequest('/tests/my-tests').then(async (backendTests) => {
        const testsWithQuestions = await Promise.all(
          backendTests.map(async (test) => {
            const questions = await apiRequest(`/questions/test/${test.id}`);
            return mapTestToCard(test, questions.length);
          })
        );
        setTests(testsWithQuestions);
      });
    } catch (error) {
      setCreateError(error.message || 'Failed to create test.');
    }
  };

  const deleteRow = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await apiRequest('/tests/delete', {
          method: 'DELETE',
          body: {
            testId: id,
            username: teacherUser?.identifier,
          },
        });

        const backendTests = await apiRequest('/tests/my-tests');
        const testsWithQuestions = await Promise.all(
          backendTests.map(async (test) => {
            const questions = await apiRequest(`/questions/test/${test.id}`);
            return mapTestToCard(test, questions.length);
          })
        );
        setTests(testsWithQuestions);
      } catch (error) {
        alert(error.message || 'Failed to delete test.');
      }
    }
  };
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTestId, setRenameTestId] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  const [renameError, setRenameError] = useState('');

  const renameTest = (id, currentName) => {
    setRenameTestId(id);
    setRenameInput(currentName || '');
    setRenameError('');
    setIsRenameDialogOpen(true);
  };

  const openManageQuestions = (test) => {
    navigate(`/teacher-dashboard/manage-questions/${test.id}`, {
      state: {
        testId: test.id,
        testName: test.name,
        testCode: test.code,
      },
    });
  };

  const togglePublish = (id) => {
    const selectedTest = tests.find((test) => test.id === id);
    if (!selectedTest) return;

    const endpoint = selectedTest.status === 'Active' ? `/tests/${id}/unpublish` : `/tests/${id}/publish`;
    apiRequest(endpoint, { method: 'PUT' })
      .then(async () => {
        const backendTests = await apiRequest('/tests/my-tests');
        const testsWithQuestions = await Promise.all(
          backendTests.map(async (test) => {
            const questions = await apiRequest(`/questions/test/${test.id}`);
            return mapTestToCard(test, questions.length);
          })
        );
        setTests(testsWithQuestions);
      })
      .catch((error) => alert(error.message || 'Failed to update publish status.'));
  };

  const closeRenameDialog = () => {
    setIsRenameDialogOpen(false);
    setRenameTestId(null);
    setRenameInput('');
    setRenameError('');
  };

  const submitRename = async (e) => {
    e.preventDefault();
    if (!renameInput.trim()) {
      setRenameError('Name cannot be empty.');
      return;
    }

    try {
      await apiRequest('/tests/rename', {
        method: 'PUT',
        body: {
          testId: renameTestId,
          newName: renameInput.trim(),
          username: teacherUser?.identifier,
        },
      });

      const backendTests = await apiRequest('/tests/my-tests');
      const testsWithQuestions = await Promise.all(
        backendTests.map(async (test) => {
          const questions = await apiRequest(`/questions/test/${test.id}`);
          return mapTestToCard(test, questions.length);
        })
      );
      setTests(testsWithQuestions);
      closeRenameDialog();
    } catch (error) {
      setRenameError(error.message || 'Failed to rename test.');
    }
  };

  const activeTestCount = tests.filter((test) => test.status === 'Active').length;
  const draftTestCount = tests.filter((test) => test.status === 'Draft').length;
  const totalQuestionCount = tests.reduce((sum, test) => sum + (test.questionCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans">
      {/* SideNavBar Shell */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/30 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200 z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex`}>
        <div className="flex flex-col h-full p-4 gap-2 text-sm font-medium">
          <div className="px-3 py-6">
            <h1 className="text-lg font-black text-indigo-700">Learning Center</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Teacher Account</p>
          </div>
          <nav className="flex-1 space-y-1">
            <a className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg transition-transform duration-200 hover:translate-x-1 cursor-pointer select-none">
              <span className="material-symbols-outlined">assignment</span>
              <span>My Tests</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-transform duration-200 hover:translate-x-1 cursor-pointer select-none cursor-pointer" onClick={() => navigate('/leaderboard')}>
              <span className="material-symbols-outlined">analytics</span>
              <span>Reports</span>
            </a>
          </nav>
          <div className="mt-auto pt-4 space-y-1 border-t border-slate-200">
            <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-transform duration-200 hover:translate-x-1" href="#">
              <span className="material-symbols-outlined">help</span>
              <span>Help Center</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 text-[#ba1a1a] hover:bg-[#ffdad6]/20 transition-transform duration-200 hover:translate-x-1 cursor-pointer" onClick={logout}>
              <span className="material-symbols-outlined">logout</span>
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 min-h-screen flex flex-col md:ml-64">
        {/* TopAppBar Shell */}
        <header className="sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm">
          <div className="flex justify-between items-center px-4 sm:px-6 h-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)} type="button">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-sm">quiz</span>
                </div>
                <span className="text-xl font-black tracking-tight text-[#0b1c30]">QuizFlow</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 ml-8">
                <a className="text-indigo-600 border-b-2 border-indigo-600 pb-1 text-sm font-bold cursor-pointer" onClick={() => navigate('/teacher-dashboard')}>Exams</a>
                <a className="text-slate-500 hover:text-indigo-600 text-sm font-semibold cursor-pointer transition-colors" onClick={() => navigate('/leaderboard')}>Leaderboard</a>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent rounded-full text-xs w-48 lg:w-64 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="Search tests..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all relative">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 ml-1 sm:ml-2 pl-3 sm:pl-4 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-[11px] font-black text-[#0b1c30] leading-tight">Welcome, {teacherName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Academic Lead</p>
                </div>
                <img alt="User profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 object-cover shadow-sm ring-2 ring-indigo-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJjynuGsPLOs9JljRIuJrxBxkiGlkIsw22gpP_0aCD9KkPnZiwPt_BAuXYVEMnhCfL293dVjVCx9oFEECYjiXKejTYHeKlwuEmf7L0JwVPe8CC8RB4WP_dtzHP7DaDAnaHSgV1fHFI0yIp-cyHnSuLm-9PyZFsteKvj5UCUYZlWCyFURH57kiDR3nBS2hqtwZwUOOktE25tZkcoXm6BfhYDyF2U5oQGwBSXqrgTa7r7lF5GdKC0xbmUQL39Fze2CBm672TMDR6w1IO" />
              </div>
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 pb-24 md:pb-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1f108e]">Test Management</h2>
              <p className="text-slate-500 text-sm sm:text-base">Create, monitor, and refine your academic assessments.</p>
            </div>
            <button className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md active:scale-95 transition-all" onClick={createQuiz}>
              <span className="material-symbols-outlined">add_circle</span>
              Create Test
            </button>
          </div>

          {/* Dashboard Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Active Tests</p>
                <p className="text-xl sm:text-2xl font-bold text-[#0b1c30]">{activeTestCount}</p>
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#89f5e7] text-[#006f66] rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Draft Tests</p>
                <p className="text-xl sm:text-2xl font-bold text-[#0b1c30]">{draftTestCount}</p>
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-[#d3e4fe] text-[#1f108e] rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Total Questions</p>
                <p className="text-xl sm:text-2xl font-bold text-[#0b1c30]">{totalQuestionCount}</p>
              </div>
            </div>
          </div>

          {/* Main Table Section - Responsive Desktop View */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Recent Tests</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:hidden">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input
                    className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Search..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400">
                  <span className="material-symbols-outlined">sort</span>
                </button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-6 py-4 font-semibold text-slate-500 border-b border-slate-100">Test Name</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 border-b border-slate-100 text-center">Duration</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 border-b border-slate-100 text-center">Created Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 border-b border-slate-100">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingTests ? (
                    <tr>
                      <td className="px-6 py-10 text-center text-slate-500" colSpan="5">
                        Loading tests...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td className="px-6 py-10 text-center text-[#ba1a1a]" colSpan="5">
                        {loadError}
                      </td>
                    </tr>
                  ) : filteredTests.length > 0 ? (
                    filteredTests.map(test => (
                      <tr key={test.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {test.code}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-lg font-semibold text-[#0b1c30]">{test.name}</p>
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{(Array.isArray(test.questions) ? test.questions.length : 0)} Q</span>
                              </div>
                              <p className="text-xs text-slate-400">{test.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-slate-600 text-sm">{test.duration}</td>
                        <td className="px-6 py-5 text-center text-slate-600 text-sm">{test.date}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${test.status === 'Active' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" title="Manage Questions" onClick={() => openManageQuestions(test)}>
                              <span className="material-symbols-outlined text-sm">edit_square</span>
                              Manage
                            </button>
                            <button className={`p-2 rounded-lg transition-colors ${test.status === 'Active' ? 'text-teal-600 hover:bg-teal-50' : 'text-orange-600 hover:bg-orange-50'}`} title={test.status === 'Active' ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(test.id)}>
                              <span className="material-symbols-outlined text-lg">{test.status === 'Active' ? 'check_circle' : 'circle'}</span>
                            </button>
                            <button className="p-2 text-[#777584] hover:bg-slate-100 rounded-lg transition-colors" title="Rename" onClick={() => renameTest(test.id, test.name)}>
                              <span className="material-symbols-outlined text-lg">drive_file_rename_outline</span>
                            </button>
                            <button className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/20 rounded-lg transition-colors" title="Delete" onClick={() => deleteRow(test.id)}>
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-10 text-center text-slate-500" colSpan="5">
                        No tests found for "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Visible only on small/medium screens) */}
            <div className="lg:hidden divide-y divide-slate-100">
              {loadingTests ? (
                <div className="p-8 text-center text-slate-500">Loading tests...</div>
              ) : loadError ? (
                <div className="p-8 text-center text-[#ba1a1a]">{loadError}</div>
              ) : filteredTests.length > 0 ? (
                filteredTests.map(test => (
                  <div key={test.id} className="p-4 space-y-4 hover:bg-indigo-50/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                          {test.code}
                        </div>
                        <div>
                          <p className="font-bold text-[#0b1c30] leading-tight">{test.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">{(Array.isArray(test.questions) ? test.questions.length : 0)} Questions</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${test.status === 'Active' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>
                              {test.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {test.duration}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {test.date.split(',')[0]}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100" onClick={() => openManageQuestions(test)}>
                        <span className="material-symbols-outlined text-base">edit_square</span>
                        Manage Questions
                      </button>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button className={`flex-1 p-2.5 rounded-lg flex items-center justify-center border transition-colors ${test.status === 'Active' ? 'text-teal-600 bg-teal-50 border-teal-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`} onClick={() => togglePublish(test.id)}>
                          <span className="material-symbols-outlined text-base mr-2">{test.status === 'Active' ? 'check_circle' : 'circle'}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{test.status === 'Active' ? 'Unpublish' : 'Publish'}</span>
                        </button>
                        <button className="p-2.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center" onClick={() => renameTest(test.id, test.name)}>
                          <span className="material-symbols-outlined text-base">drive_file_rename_outline</span>
                        </button>
                        <button className="p-2.5 text-[#ba1a1a] bg-[#ffdad6]/10 border border-[#ffdad6] rounded-lg flex items-center justify-center" onClick={() => deleteRow(test.id)}>
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">No tests found.</div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium">Showing 1 to {filteredTests.length} of {filteredTests.length} tests</p>
              <div className="flex gap-1">
                <button className="p-1.5 text-[#777584] hover:text-indigo-600 transition-colors border border-slate-100 rounded-lg">
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">1</button>
                <button className="p-1.5 text-[#777584] hover:text-indigo-600 transition-colors border border-slate-100 rounded-lg">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary CTA Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="relative overflow-hidden group bg-gradient-to-br from-[#3730a3] to-indigo-900 rounded-3xl p-6 sm:p-8 text-white min-h-[12rem] flex flex-col justify-end">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative z-10 space-y-2">
                <h4 className="text-xl sm:text-2xl font-bold">Import Question Bank</h4>
                <p className="text-indigo-100 text-sm sm:text-base max-w-sm">Save time by importing your previous test questions directly from CSV or Excel.</p>
                <button className="mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 border border-white/10">
                  Explore Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="bg-[#e5eeff] rounded-3xl p-6 sm:p-8 border border-indigo-100 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600 bg-white p-2 rounded-xl shadow-sm">tips_and_updates</span>
                <h4 className="text-lg sm:text-xl font-semibold text-[#1f108e]">Pro Tip</h4>
              </div>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">Did you know? Tests with automated feedback see a 40% higher completion rate among students. Try adding detailed explanations to your questions.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-8 px-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs gap-4">
            <p>© 2023 QuizFlow Academic Portal. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-indigo-500 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-indigo-500 transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-indigo-500 transition-colors" href="#">System Status</a>
            </div>
          </div>
        </footer>
      </main>
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={closeCreateDialog}>
          <form className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-auto" onClick={(e) => e.stopPropagation()} onSubmit={submitCreateQuiz}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30]">Create New Test</h3>
                <p className="text-sm text-slate-500 mt-1">Provide the test name, passcode, and duration.</p>
              </div>
              <button type="button" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all" onClick={closeCreateDialog} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Name</label>
                <input value={newTestName} onChange={(e) => setNewTestName(e.target.value)} placeholder="Enter test name" className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Passcode (Optional)</label>
                <input value={newTestPasscode} onChange={(e) => setNewTestPasscode(e.target.value)} placeholder="Enter passcode" className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Duration (minutes)</label>
                <input value={newTestDuration} onChange={(e) => setNewTestDuration(e.target.value)} placeholder="e.g. 60" type="number" min="1" className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" required />
              </div>

              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all" onClick={closeCreateDialog}>Cancel</button>
                <button type="submit" className="px-8 py-3 text-sm font-bold bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all">Create Test</button>
              </div>
            </div>
          </form>
        </div>
      )}
      {isRenameDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={closeRenameDialog}>
          <form className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-auto" onClick={(e) => e.stopPropagation()} onSubmit={submitRename}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0b1c30]">Rename Test</h3>
                <p className="text-sm text-slate-500 mt-1">Provide a new name for this test.</p>
              </div>
              <button type="button" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all" onClick={closeRenameDialog} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Test Name</label>
                <input value={renameInput} onChange={(e) => { setRenameInput(e.target.value); if (renameError) setRenameError(''); }} placeholder="Enter new test name" className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" required />
              </div>

              {renameError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {renameError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all" onClick={closeRenameDialog}>Cancel</button>
                <button type="submit" className="px-8 py-3 text-sm font-bold bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all">Rename</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
