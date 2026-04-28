import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const fallbackTestCards = [
    {
      category: 'Mathematics',
      categoryClassName: 'bg-[#86f2e4] text-[#006f66]',
      duration: '60 mins',
      title: 'Advanced Calculus Midterm',
      teacher: 'Dr. Helena Vance',
      testName: 'Advanced Calculus',
      featured: false,
      titleClassName: 'text-[#0b1c30]',
      teacherClassName: 'text-[#464553]',
      actionClassName: 'text-indigo-600',
      lockIconClassName: 'text-[#777584] group-hover:text-indigo-400',
      containerClassName: 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200',
    },
    {
      category: 'History',
      categoryClassName: 'bg-[#ffdadb] text-[#92002a]',
      duration: '45 mins',
      title: 'World War II Foundations',
      teacher: 'Prof. Marcus Thorne',
      testName: 'World War II',
      featured: false,
      titleClassName: 'text-[#0b1c30]',
      teacherClassName: 'text-[#464553]',
      actionClassName: 'text-indigo-600',
      lockIconClassName: 'text-[#777584] group-hover:text-indigo-400',
      containerClassName: 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200',
    },
    {
      category: 'Computer Science',
      categoryClassName: 'bg-white/20 backdrop-blur-sm text-white',
      duration: '120 mins',
      title: 'Data Structures & Algorithms Final',
      teacher: 'Dr. Sarah Chen',
      testName: 'Physics',
      featured: true,
      titleClassName: 'text-white',
      teacherClassName: 'text-indigo-200',
      actionClassName: 'text-white',
      lockIconClassName: 'text-indigo-300',
      containerClassName: 'bg-[#1f108e] text-white border border-transparent shadow-xl relative overflow-hidden',
    },
    {
      category: 'Biology',
      categoryClassName: 'bg-[#d3e4fe] text-[#464553]',
      duration: '30 mins',
      title: 'Cellular Respiration Quiz',
      teacher: 'Ms. Julianne Moore',
      testName: 'Biology',
      featured: false,
      titleClassName: 'text-[#0b1c30]',
      teacherClassName: 'text-[#464553]',
      actionClassName: 'text-indigo-600',
      lockIconClassName: 'text-[#777584] group-hover:text-indigo-400',
      containerClassName: 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200',
    },
  ];

  const [storedTests, setStoredTests] = useState([]);

  useEffect(() => {
    const savedTests = JSON.parse(localStorage.getItem('quizflow_tests') || '[]');
    setStoredTests(savedTests);
  }, []);

  const testCards = storedTests.length > 0
    ? storedTests.map((test) => ({
        category: test.unit || 'Assessment',
        categoryClassName: 'bg-[#d3e4fe] text-[#464553]',
        duration: test.duration || `${Math.max(1, Math.round((test.durationSeconds || 900) / 60))} mins`,
        title: test.name,
        teacher: test.ownerName || 'Instructor',
        testName: test.name,
        featured: test.status === 'Active',
        titleClassName: 'text-[#0b1c30]',
        teacherClassName: 'text-[#464553]',
        actionClassName: 'text-indigo-600',
        lockIconClassName: 'text-[#777584] group-hover:text-indigo-400',
        containerClassName: 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200',
        passcode: test.passcode || '1234',
        durationSeconds: test.durationSeconds,
        id: test.id,
      }))
    : fallbackTestCards;

  const filteredTestCards = testCards.filter((card) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return [card.category, card.title, card.teacher].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('quizflow_current_user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    } else {
      setUserName(user.name);
    }
  }, [navigate]);

  useEffect(() => {
    const loadNotifications = () => {
      const stored = JSON.parse(localStorage.getItem('quizflow_notifications') || '[]');
      setNotifications(stored);
    };

    loadNotifications();

    const handleStorage = (event) => {
      if (event.key === 'quizflow_notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem('quizflow_current_user');
    navigate('/login');
  };

  const startTest = (test) => {
    setSelectedTest(test);
    setPasscodeInput('');
    setPasscodeError('');
    setIsPasscodeDialogOpen(true);
  };

  const closePasscodeDialog = () => {
    setIsPasscodeDialogOpen(false);
    setPasscodeInput('');
    setPasscodeError('');
  };

  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  const markNotificationsAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('quizflow_notifications', JSON.stringify(updatedNotifications));
  };

  const submitPasscode = (e) => {
    e.preventDefault();

    const expectedPasscode = selectedTest?.passcode || '1234';
    if (passcodeInput === expectedPasscode) {
      localStorage.setItem('quizflow_active_test', JSON.stringify(selectedTest || {}));
      closePasscodeDialog();
      navigate('/quiz', { state: { testId: selectedTest?.id, testName: selectedTest?.title || selectedTest?.testName } });
      return;
    }

    setPasscodeError('Invalid passcode.');
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200 flex flex-col p-4 gap-2 text-sm font-medium z-50">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e5eeff] rounded-lg flex items-center justify-center text-[#1f108e]">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-indigo-700">Learning Center</h1>
            <p className="text-xs text-slate-500">Student Account</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg transition-transform duration-200 cursor-pointer select-none">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-transform duration-200 cursor-pointer select-none" onClick={() => navigate('/leaderboard')}>
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </a>
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-200 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-transform duration-200 cursor-pointer select-none">
            <span className="material-symbols-outlined">help</span>
            <span>Help Center</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-[#ba1a1a] hover:bg-[#ffdad6]/20 transition-transform duration-200 cursor-pointer select-none" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        {/* Top App Bar */}
        <header className="sticky top-0 w-full flex justify-between items-center px-6 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm z-40">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-indigo-700">QuizFlow</span>
            <nav className="hidden md:flex gap-6">
              <a className="text-indigo-600 border-b-2 border-indigo-600 pb-1 text-sm font-semibold cursor-pointer" onClick={() => navigate('/student-dashboard')}>Dashboard</a>
              <a className="text-slate-600 hover:text-indigo-500 transition-colors duration-200 text-sm font-semibold cursor-pointer" onClick={() => navigate('/leaderboard')}>Leaderboard</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-150 relative"
                onClick={() => {
                  setIsNotificationsOpen((open) => !open);
                  markNotificationsAsRead();
                }}
                type="button"
              >
              <span className="material-symbols-outlined">notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div>
                      <h3 className="text-sm font-bold text-[#0b1c30]">Notifications</h3>
                      <p className="text-xs text-slate-500">Latest updates from your teachers</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                      onClick={markNotificationsAsRead}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-slate-100 last:border-b-0 ${notification.read ? 'bg-white' : 'bg-indigo-50/60'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[18px]">campaign</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#0b1c30]">{notification.title}</p>
                              <p className="text-sm text-[#464553]">{notification.message}</p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <span className="material-symbols-outlined text-slate-300 text-3xl">notifications_off</span>
                        <p className="text-sm font-semibold text-[#0b1c30] mt-2">No notifications yet</p>
                        <p className="text-xs text-slate-500">New tests created by teachers will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5t47lpWHVrqH6l9vqW6_60mNs4zfTtvcn6tNNuJy1JXs-wFmVxWaj2-z9_UTc5JxEGGjabLtBAMh6UGjaHEmxTZFuYrnW-Q5-qOqwWWweZa8-00-3-gE4QoJWr1Dhl31HPU091MhQOxF-21vv49_NbpmXV0N1Q42At5-MEdpDEwFrpcE1h3r3TEsARBPzPNLA6fLaG0WBSTGPXFBPOxmFLniga9fQ8WnVYx9Bid79Bj4Lg5UN9_0NiVkbClilu74gWK1p4VFO4B20" />
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="max-w-7xl mx-auto p-8">
          {notifications.length > 0 && (
            <div className="mb-8 bg-[#e5eeff] border border-indigo-100 rounded-2xl px-5 py-4 flex items-start gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-white text-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#1f108e]">New test notification</p>
                    <p className="text-sm text-[#464553]">
                      {notifications[0].message}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1f108e] hover:underline self-start sm:self-center"
                    onClick={() => setIsNotificationsOpen(true)}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero & Search Section */}
          <section className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-[#0b1c30]">Welcome, {userName}</h2>
              <p className="text-lg text-[#464553] max-w-lg">
                Select a test from your curriculum to begin. Please ensure you have your access passcode ready.
              </p>
            </div>
            <div className="w-full md:w-96">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777584]">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-xl text-base transition-all duration-200" 
                  placeholder="Search by test name or teacher..." 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Test Grid (Bento Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestCards.length > 0 ? (
              filteredTestCards.map((card) => (
                <div
                  key={card.title}
                  className={`${card.containerClassName} p-6 rounded-xl transition-all duration-300 flex flex-col group ${card.featured ? 'lg:col-span-1' : ''}`}
                >
                  {card.featured && (
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  )}
                  <div className={`flex justify-between items-start mb-4 ${card.featured ? 'relative z-10' : ''}`}>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${card.categoryClassName}`}>
                      {card.category}
                    </div>
                    <div className={`flex items-center gap-1 ${card.featured ? 'text-white/80' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span className="text-xs font-semibold">{card.duration}</span>
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-1 ${card.titleClassName} ${card.featured ? 'relative z-10' : ''}`}>
                    {card.title}
                  </h3>
                  <p className={`text-base mb-8 ${card.teacherClassName} ${card.featured ? 'relative z-10' : ''}`}>
                    {card.teacher}
                  </p>
                  <div className={`mt-auto pt-4 border-t flex items-center justify-between ${card.featured ? 'border-white/20 relative z-10' : 'border-slate-100'}`}>
                    <button
                      className={`flex items-center gap-2 font-semibold hover:gap-3 transition-all ${card.actionClassName}`}
                      onClick={() => startTest(card)}
                    >
                      Enter Passcode
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <span className={`material-symbols-outlined ${card.lockIconClassName}`}>
                      {card.featured ? 'lock_open' : 'lock'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <h3 className="text-lg font-bold text-[#0b1c30] mb-2">No tests found</h3>
                <p className="text-sm text-[#464553]">Try a different test name, category, or teacher.</p>
              </div>
            )}

            {/* Recent Results */}
            <div className="lg:col-span-2 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-indigo-700 mb-2">
                  <span className="material-symbols-outlined">stars</span>
                  <span className="text-sm font-semibold">Recent Performance</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0b1c30] mb-2">Psychology 101: Midterm</h3>
                <p className="text-base text-[#464553]">You scored better than 85% of your peers. Keep up the excellent work!</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-8 py-6 bg-white rounded-2xl shadow-sm border border-indigo-100">
                  <div className="text-4xl font-bold text-indigo-700">92%</div>
                  <div className="text-xs font-semibold text-slate-500">SCORE</div>
                </div>
                <button className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors active:scale-95" onClick={() => navigate('/results')}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Banner */}
          <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                <span className="material-symbols-outlined">fact_check</span>
              </div>
              <div className="text-xl font-semibold">12</div>
              <div className="text-xs font-semibold text-slate-500">Tests Taken</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#86f2e4]/30 rounded-full flex items-center justify-center text-[#006a61] mb-2">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div className="text-xl font-semibold">88%</div>
              <div className="text-xs font-semibold text-slate-500">Avg. Score</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#ffdadb]/30 rounded-full flex items-center justify-center text-[#8a0027] mb-2">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div className="text-xl font-semibold">4.2h</div>
              <div className="text-xs font-semibold text-slate-500">Focus Time</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#d3e4fe] rounded-full flex items-center justify-center text-[#464553] mb-2">
                <span className="material-symbols-outlined">emoji_events</span>
              </div>
              <div className="text-xl font-semibold">Gold</div>
              <div className="text-xs font-semibold text-slate-500">Rank Status</div>
            </div>
          </section>
        </div>
      </main>
      {isPasscodeDialogOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePasscodeDialog}
        >
          <form
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitPasscode}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-[#0b1c30]">Enter Passcode</h3>
                <p className="text-sm text-[#464553] mt-1">{selectedTest?.title || selectedTest?.testName || 'Selected test'}</p>
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={closePasscodeDialog}
                aria-label="Close passcode dialog"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label className="block text-sm font-semibold text-[#0b1c30] mb-2" htmlFor="passcode_input">
              Passcode
            </label>
            <input
              id="passcode_input"
              type="password"
              autoFocus
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                if (passcodeError) setPasscodeError('');
              }}
              placeholder="Enter exam passcode"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-transparent focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required
            />
            {passcodeError && <p className="text-sm text-[#ba1a1a] mt-2">{passcodeError}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={closePasscodeDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold bg-[#1f108e] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
