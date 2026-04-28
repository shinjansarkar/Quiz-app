import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeTest = location.state || {};
  const storedTest = JSON.parse(localStorage.getItem('quizflow_active_test') || '{}');
  const activeTest = { ...storedTest, ...routeTest };
  const quizTitle = activeTest.title || activeTest.testName || 'Advanced Physics Assessment';
  
  const [questions] = useState(() => {
    const activeQuestions = Array.isArray(activeTest.questions) ? activeTest.questions : [];
    if (activeQuestions.length > 0) {
      return activeQuestions.map((question, index) => ({
        id: question.id || index + 1,
        text: question.text || question.questionText || `Question ${index + 1}`,
        options: question.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: question.correctIndex ?? question.correct ?? 0,
      }));
    }

    const base = [
      { id: 1, text: "A particle moves along the x-axis with a velocity given by v(t) = 3t² - 6t. If the particle starts at the origin at t = 0, what is its position at t = 3?", options: ["9 units", "0 units", "18 units", "-9 units"], correct: 1 },
      { id: 2, text: "What is the work done by a conservative force around a closed loop?", options: ["Zero", "Positive", "Negative", "Depends on the path"], correct: 0 },
      { id: 3, text: "Which of the following is a statement of the First Law of Thermodynamics?", options: ["Energy cannot be created or destroyed", "Entropy always increases", "Absolute zero cannot be reached", "Force equals mass times acceleration"], correct: 0 },
      { id: 4, text: "What is the speed of light in a vacuum?", options: ["3 x 10^8 m/s", "3 x 10^6 m/s", "1.5 x 10^8 m/s", "Infinite"], correct: 0 },
      { id: 5, text: "Which particle is the carrier of the electromagnetic force?", options: ["Gluon", "Photon", "W boson", "Graviton"], correct: 1 }
    ];
    
    for (let i = 6; i <= 20; i++) {
      base.push({
        id: i,
        text: `Advanced Physics Question ${i}: Dummy question content for assessment purposes.`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0
      });
    }
    return base;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem('quiz_answers') || '{}'));
  const [marked, setMarked] = useState(() => JSON.parse(localStorage.getItem('quiz_marked') || '[]'));
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const durationSeconds = Number(activeTest.durationSeconds);
    if (!Number.isNaN(durationSeconds) && durationSeconds > 0) {
      return durationSeconds;
    }

    const durationText = activeTest.duration || '';
    const parsedSeconds = Number.parseInt(durationText, 10);
    if (!Number.isNaN(parsedSeconds) && parsedSeconds > 0 && durationText.includes('sec')) {
      return parsedSeconds;
    }

    return 900;
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('quizflow_current_user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuizAuto(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answers]);

  const selectOption = (idx) => {
    const q = questions[currentIdx];
    const newAnswers = { ...answers, [q.id]: idx };
    setAnswers(newAnswers);
    localStorage.setItem('quiz_answers', JSON.stringify(newAnswers));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const markForReview = () => {
    const q = questions[currentIdx];
    let newMarked;
    if (marked.includes(q.id)) {
      newMarked = marked.filter((id) => id !== q.id);
    } else {
      newMarked = [...marked, q.id];
    }
    setMarked(newMarked);
    localStorage.setItem('quiz_marked', JSON.stringify(newMarked));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const submitQuizAuto = (currentAnswers) => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (currentAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);
    const currentUser = JSON.parse(localStorage.getItem('quizflow_current_user') || '{}');
    const testName = quizTitle;
    const timeUsed = (Number(activeTest.durationSeconds) || 900) - timeRemaining;

    localStorage.setItem('quiz_last_score', score);
    localStorage.setItem('quiz_last_correct', correctCount);
    localStorage.setItem('quiz_last_time', timeUsed);
    localStorage.setItem('quiz_last_test', JSON.stringify({ testName, score, correctCount, totalQuestions: questions.length, timeUsed }));

    const studentName = currentUser && currentUser.role === 'student' ? currentUser.name : 'Student';
    const submissions = JSON.parse(localStorage.getItem('quizflow_submissions') || '[]');
    submissions.unshift({
      id: `submission-${Date.now()}`,
      testName,
      studentName,
      score,
      correctCount,
      totalQuestions: questions.length,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('quizflow_submissions', JSON.stringify(submissions));

    localStorage.removeItem('quiz_answers');
    localStorage.removeItem('quiz_marked');

    navigate('/results');
  };

  const submitQuiz = () => {
    submitQuizAuto(answers);
  };

  const q = questions[currentIdx];
  const attempted = Object.keys(answers).length;
  const unattempted = questions.length - attempted;
  const markedCount = marked.length;

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full flex justify-between items-center px-6 h-16 max-w-7xl mx-auto bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-tight text-indigo-700">QuizFlow</span>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <h1 className="text-base font-semibold text-[#0b1c30]">{quizTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-4 py-2 rounded-lg text-sm font-semibold">
            <span className="material-symbols-outlined">timer</span>
            <span className="tabular-nums">{formatTime(timeRemaining)}</span>
          </div>
          <button 
            className="flex items-center gap-2 bg-[#1f108e] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95 duration-150"
            onClick={() => setShowModal(true)}
          >
            Submit
          </button>
        </div>
      </header>

      {/* Progress Indicator Strip */}
      <div className="w-full h-1.5 bg-[#d3e4fe]">
        <div 
          className="h-full bg-[#6bd8cb] rounded-full transition-all duration-500" 
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <main className="flex-grow flex max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Center Area: Question Content */}
        <div className="flex-grow flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[#1f108e] text-sm font-semibold bg-[#e2dfff] px-3 py-1 rounded-full">
                Question {String(q.id).padStart(2, '0')} of {questions.length}
              </span>
              <span className="text-[#777584] text-xs">4 Points</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0b1c30] leading-relaxed">
              {q.text}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-1 gap-4">
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === i;
              return (
                <button 
                  key={i}
                  className={`flex items-center p-6 bg-white border rounded-xl text-left transition-all group ${isSelected ? 'border-2 border-[#1f108e] bg-[#3730a3]/5' : 'border-slate-200 hover:border-[#3730a3] hover:bg-[#3730a3]/5'}`} 
                  onClick={() => selectOption(i)}
                >
                  <span className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold mr-4 transition-colors ${isSelected ? 'bg-[#3730a3] text-white' : 'bg-slate-100 text-[#464553] group-hover:bg-[#3730a3] group-hover:text-white'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-lg text-[#0b1c30]">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Question Palette */}
        <aside className="w-80 flex flex-col gap-6 h-fit sticky top-24">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">grid_view</span>
              Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((question, i) => {
                let bgClass = 'bg-[#d3e4fe] text-[#464553]';
                if (i === currentIdx) bgClass = 'bg-[#3730a3] text-white shadow-md';
                else if (marked.includes(question.id)) bgClass = 'bg-[#ffdadb] text-[#92002a] border-2 border-[#ffb2b7]';
                else if (answers[question.id] !== undefined) bgClass = 'bg-[#006a61] text-white';

                return (
                  <button 
                    key={question.id}
                    onClick={() => setCurrentIdx(i)} 
                    className={`w-full aspect-square flex items-center justify-center rounded-lg ${bgClass} text-sm font-semibold transition-transform hover:scale-105 active:scale-95`}
                  >
                    {String(question.id).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-4 h-4 rounded-sm bg-[#006a61]"></span>
                <span className="text-[#464553]">Attempted</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-4 h-4 rounded-sm bg-[#d3e4fe]"></span>
                <span className="text-[#464553]">Unattempted</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-4 h-4 rounded-sm bg-[#ffdadb] border border-[#ffb2b7]"></span>
                <span className="text-[#464553]">Marked for Review</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-4 h-4 rounded-sm bg-[#3730a3]"></span>
                <span className="text-[#464553]">Current Question</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div className="text-lg font-bold text-[#0b1c30]">{attempted}</div>
                <div className="text-[11px] text-[#464553] font-semibold">Attempted</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div className="text-lg font-bold text-[#0b1c30]">{unattempted}</div>
                <div className="text-[11px] text-[#464553] font-semibold">Unattempted</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div className="text-lg font-bold text-[#0b1c30]">{markedCount}</div>
                <div className="text-[11px] text-[#464553] font-semibold">Review</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#1f108e]">lightbulb</span>
              <div>
                <h4 className="text-sm font-semibold text-[#0b1c30]">Review later?</h4>
                <p className="text-xs text-[#464553] mt-1">Use 'Mark for Review' to easily return to this question before final submission.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Action Bar */}
      <footer className="bg-white border-t border-slate-200 p-6 sticky bottom-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#1f108e] text-[#1f108e] font-semibold hover:bg-[#e2dfff] transition-colors active:scale-95"
              onClick={prevQuestion}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#8a0027] text-[#8a0027] font-semibold hover:bg-[#ffdadb] transition-colors active:scale-95"
              onClick={markForReview}
            >
              <span className="material-symbols-outlined">bookmark</span>
              {marked.includes(q.id) ? 'Unmark Review' : 'Mark for Review'}
            </button>
          </div>
          <button 
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#1f108e] text-white font-semibold hover:opacity-90 shadow-lg active:scale-95 transition-all"
              onClick={() => {
                if (currentIdx === questions.length - 1) {
                  setShowModal(true);
                  return;
                }

                nextQuestion();
              }}
          >
            {currentIdx === questions.length - 1 ? 'Submit' : 'Next Question'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>

      {/* Overlay: Confirm Submit */}
      {showModal && (
        <div className="fixed inset-0 bg-[#213145]/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-2xl transform scale-100 transition-transform duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e2dfff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#1f108e]">
                <span className="material-symbols-outlined text-4xl">fact_check</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0b1c30] mb-4">Finish Assessment?</h3>
              <p className="text-[#464553] mb-6">You have {attempted} attempted questions and {unattempted} unattempted. Once submitted, you cannot change your answers.</p>
              <div className="flex flex-col gap-4">
                <button 
                  className="w-full py-3 bg-[#1f108e] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity" 
                  onClick={submitQuiz}
                >
                  Yes, Submit Now
                </button>
                <button 
                  className="w-full py-3 text-[#777584] font-semibold hover:bg-slate-100 transition-colors rounded-xl"
                  onClick={() => setShowModal(false)}
                >
                  Review Answers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
