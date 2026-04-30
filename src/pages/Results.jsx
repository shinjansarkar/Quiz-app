import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest, getStoredUser } from '../config/api';

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeResult = location.state?.submission || location.state || {};
  const [greeting, setGreeting] = useState('Excellent Work!');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeTaken, setTimeTaken] = useState('--');
  const [testName, setTestName] = useState('Latest Assessment');

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      navigate('/leaderboard');
      return;
    }

    setGreeting(`Excellent Work, ${user.name.split(' ')[0]}!`);

    const applyResult = (result) => {
      if (!result) return;
      const computedCorrect = Number(result.correctCount ?? result.score) || 0;
      const computedTotal = Number(result.total || result.totalQuestions) || 0;
      const computedTime = Number(result.timeUsed ?? result.timeTaken);
      const computedPercentage = computedTotal > 0
        ? Math.round((computedCorrect / computedTotal) * 100)
        : Number(result.percentage ?? result.scorePercentage ?? result.finalScore) || 0;

      setScore(Math.max(0, Math.min(100, computedPercentage)));
      setCorrect(computedCorrect);
      setTotal(computedTotal);
      setTestName(result.testName || 'Latest Assessment');

      if (!Number.isNaN(computedTime) && computedTime >= 0) {
        const mins = Math.floor(computedTime / 60);
        const secs = computedTime % 60;
        setTimeTaken(`${mins}:${String(secs).padStart(2, '0')}`);
      }
    };

    if (routeResult && Object.keys(routeResult).length > 0) {
      applyResult(routeResult);
      return;
    }

    apiRequest('/tests/results/my-results')
      .then((results) => {
        applyResult(Array.isArray(results) && results.length > 0 ? results[0] : null);
      })
      .catch(() => {
        applyResult(null);
      });
  }, [navigate]);

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="sticky top-0 w-full flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-3 sm:py-0 min-h-16 max-w-7xl mx-auto bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-indigo-700">QuizFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 h-full">
          <a className="text-slate-600 hover:text-indigo-500 transition-colors duration-200 cursor-pointer" onClick={() => navigate('/student-dashboard')}>Dashboard</a>
          <a className="text-slate-600 hover:text-indigo-500 transition-colors duration-200 cursor-pointer" onClick={() => navigate('/leaderboard')}>Leaderboard</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 ml-2">
            <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBAerkbYOL7eQlamKO42NCiOP-8PAxDkU-RrO02HBZyk5kcgROYwNyOph8xcoPCNWBTQ3Ik5CsiQDeC6CNMmZ1-xxTKFibX_x-oF9_0xjPDeqKHiGpww1vZCvY5C1aza_G4EuWmBfo8t25VwFhhgGuWAjCpmUXxur-es2FPR7JvgBE6Lt6ZWei1wSrSHx_KdsPLVj7LxstNrL_mc_MqaThIrNqTe51QTMUK9JnjUCszIDFJRH-hqLUZuFxtvkws88xSrVbGN-9nIj7" />
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero Results Section */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl shadow-[0_8px_30px_rgb(31,16,142,0.04)] border border-slate-100 flex flex-col items-center text-center">
            <div className="mb-6">
              <span className="inline-flex text-[#006a61] font-semibold px-4 py-1 bg-[#86f2e4]/20 rounded-full text-sm">Assessment Completed</span>
              <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-[#1f108e]">{greeting}</h1>
              <p className="text-[#464553] text-sm sm:text-lg mt-2">You've successfully completed the {testName}.</p>
            </div>
            
            {/* Score Indicator */}
            <div className="relative flex items-center justify-center w-44 h-44 sm:w-64 sm:h-64 mb-6">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center" 
                style={{
                  background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#1f108e ${score}%, #e5eeff 0)`
                }}
              >
                <div className="text-center z-10">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#1f108e] block">{score}%</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#464553] uppercase tracking-widest">Final Score</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#6bd8cb] rounded-full opacity-20"></div>
              <div className="absolute bottom-10 -left-6 w-12 h-12 bg-[#3730a3] rounded-full opacity-10"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <button 
                className="flex-1 h-12 bg-[#1f108e] text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg active:scale-95 duration-150"
                onClick={() => navigate('/leaderboard')}
              >
                View Detailed Ranking
              </button>
              <button 
                className="flex-1 h-12 border-2 border-[#1f108e] text-[#1f108e] rounded-lg font-semibold hover:bg-[#3730a3]/5 transition-all active:scale-95 duration-150"
                onClick={() => navigate('/student-dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-6">
            {/* Stat Card: Correct Answers */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 bg-[#86f2e4]/20 text-[#006a61] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <div>
                <p className="text-[#464553] text-xs font-semibold">Correct Answers</p>
                <p className="text-2xl font-bold text-[#1f108e]">{correct} <span className="text-base font-normal text-[#464553]">/ {total || '--'}</span></p>
              </div>
            </div>

            {/* Stat Card: Time Taken */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 bg-[#e2dfff] text-[#1f108e] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">timer</span>
              </div>
              <div>
                <p className="text-[#464553] text-xs font-semibold">Time Taken</p>
                <p className="text-2xl font-bold text-[#1f108e]">{timeTaken} <span className="text-base font-normal text-[#464553]">min</span></p>
              </div>
            </div>

            {/* Stat Card: Rank */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 bg-[#ffdadb] text-[#600019] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">leaderboard</span>
              </div>
              <div>
                <p className="text-[#464553] text-xs font-semibold">Class Rank</p>
                <p className="text-2xl font-bold text-[#1f108e]">--</p>
              </div>
            </div>

            {/* Encouragement Card */}
            <div className="bg-[#3730a3] p-5 sm:p-6 rounded-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Next Steps</h3>
                <p className="text-sm opacity-90">Keep practicing and review the challenging topics to improve your score next time.</p>
                <button className="mt-4 text-white text-sm font-semibold flex items-center gap-2 hover:underline">
                  Improve Yourself <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Space */}
      <footer className="w-full h-16 flex items-center justify-center border-t border-slate-200 text-[#464553] text-xs">
        © 2024 QuizFlow Learning Systems. All academic rights reserved.
      </footer>
    </div>
  );
}
