import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiRequest, getStoredUser } from '../config/api';


export default function ManageQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testId } = useParams();
  const currentUser = getStoredUser();

  const testContext = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  const mapQuestion = (question) => ({
    id: question.id,
    text: question.question,
    options: [question.opt1, question.opt2, question.opt3, question.opt4],
    correctIndex: question.correct,
    editedAt: 'Saved in Supabase',
    accuracyRate: 'Live data',
  });

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      try {
        const fresh = await apiRequest(`/questions/test/${testId}`);
        if (isMounted) {
          setQuestions(fresh.map(mapQuestion));
        }
      } catch {
        if (isMounted) {
          setQuestions([]);
        }
      }
    };

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [testId]);

  const clearForm = () => {
    setQText(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setCorrectIndex(0); setEditingId(null);
  };

  const handleStartAdd = () => {
    clearForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveQuestion = () => {
    const trimmed = qText.trim();
    if (!trimmed) return;
    const opts = [optA.trim(), optB.trim(), optC.trim(), optD.trim()].map((o) => o || '');
    const request = editingId
      ? apiRequest('/questions/edit', {
          method: 'PUT',
          body: {
            username: currentUser?.identifier,
            question: {
              id: editingId,
              question: trimmed,
              opt1: opts[0],
              opt2: opts[1],
              opt3: opts[2],
              opt4: opts[3],
              correct: Number(correctIndex) || 0,
              testId: Number(testId),
            },
          },
        })
      : apiRequest('/questions/add', {
          method: 'POST',
          body: {
            username: currentUser?.identifier,
            question: {
              question: trimmed,
              opt1: opts[0],
              opt2: opts[1],
              opt3: opts[2],
              opt4: opts[3],
              correct: Number(correctIndex) || 0,
              testId: Number(testId),
            },
          },
        });

    request
      .then(async () => {
        const fresh = await apiRequest(`/questions/test/${testId}`);
        setQuestions(fresh.map(mapQuestion));
        clearForm();
      })
      .catch((error) => alert(error.message || 'Failed to save question.'));
  };

  const handleEditQuestion = (q) => {
    setEditingId(q.id);
    setQText(q.text || '');
    setOptA(q.options?.[0] || '');
    setOptB(q.options?.[1] || '');
    setOptC(q.options?.[2] || '');
    setOptD(q.options?.[3] || '');
    setCorrectIndex(q.correctIndex ?? 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = (id) => {
    setDeleteQuestionId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteQuestionId === null) return;

    apiRequest('/questions/delete', {
      method: 'DELETE',
      body: {
        username: currentUser?.identifier,
        questionId: deleteQuestionId,
      },
    })
      .then(async () => {
        const fresh = await apiRequest(`/questions/test/${testId}`);
        setQuestions(fresh.map(mapQuestion));
        setIsDeleteDialogOpen(false);
        setDeleteQuestionId(null);
      })
      .catch((error) => alert(error.message || 'Failed to delete question.'));
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteQuestionId(null);
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'teacher') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'teacher') {
    return null;
  }

  const testTitle = useMemo(() => {
    if (testContext.testName) return testContext.testName;
    if (testId) return `Test ${testId}`;
    return 'Assessment';
  }, [testContext.testName, testId]);

  const questionCount = questions.length;

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] antialiased min-h-screen">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full py-8 w-64 bg-slate-50 border-r border-slate-200 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-lg font-extrabold text-indigo-700">QuizFlow</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Instructor Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-slate-500 hover:bg-slate-100 hover:text-indigo-600" onClick={() => navigate('/teacher-dashboard')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700">
            <span className="material-symbols-outlined">quiz</span>
            <span className="text-sm font-semibold">Questions</span>
          </button>
        </nav>
        <div className="mt-auto px-4 space-y-2">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-slate-500 hover:bg-slate-100" onClick={() => navigate('/teacher-dashboard')}>
            <span className="material-symbols-outlined">help_outline</span>
            <span className="text-sm font-semibold">Help</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-700">account_circle</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser?.name || 'Instructor'}</p>
              <p className="text-[10px] text-slate-500">Manage your curriculum</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="md:ml-64 flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 w-full bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden material-symbols-outlined text-slate-600" onClick={() => navigate('/teacher-dashboard')}>menu</button>
            <h2 className="text-2xl font-bold tracking-tight text-indigo-800">QuizFlow</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="material-symbols-outlined text-slate-400 text-sm mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48 text-[#0b1c30]" placeholder="Search questions..." type="text" />
            </div>
            <button className="text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
            </button>
            <button className="text-indigo-700 font-semibold flex items-center gap-2 hover:bg-slate-50 p-1.5 px-3 rounded-lg transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
              <span className="hidden sm:inline text-sm font-semibold">Instructor View</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                <span>Quizzes</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-[#1f108e] font-bold">{testTitle}</span>
              </nav>
              <h1 className="text-3xl font-bold text-[#0b1c30]">Manage Questions</h1>
              <p className="text-[#464553] mt-1">Review, edit, and organize assessment items for your students.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1f108e] text-white rounded-lg font-semibold hover:opacity-90 shadow-lg transition-all active:scale-95" onClick={handleStartAdd}>
                <span className="material-symbols-outlined">add_circle</span>
                Add New Question
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section className="lg:col-span-5 bg-white rounded-xl border border-[#c8c4d5] shadow-sm p-6 sticky top-24">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1f108e]">edit_note</span>
                  Create Question
                </h3>
                <span className="bg-[#e5eeff] px-3 py-1 rounded-full text-xs font-semibold text-[#1f108e]">Multiple Choice</span>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveQuestion(); }}>
                <div>
                  <label className="text-sm font-semibold text-[#464553] block mb-2">Question Text</label>
                  <textarea value={qText} onChange={(e) => setQText(e.target.value)} className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all text-base resize-none" placeholder="e.g. What is the escape velocity of Earth at its surface?" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#464553] block mb-2">Option A</label>
                  <input value={optA} onChange={(e) => setOptA(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all text-base" placeholder="Choice A" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#464553] block mb-2">Option B</label>
                  <input value={optB} onChange={(e) => setOptB(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all text-base" placeholder="Choice B" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#464553] block mb-2">Option C</label>
                  <input value={optC} onChange={(e) => setOptC(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all text-base" placeholder="Choice C" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#464553] block mb-2">Option D</label>
                  <input value={optD} onChange={(e) => setOptD(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all text-base" placeholder="Choice D" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#464553] block mb-2">Correct Answer</label>
                  <select value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all text-base appearance-none">
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" className="flex-1 py-3 border border-[#777584] text-[#464553] font-semibold rounded-lg hover:bg-slate-50 transition-colors" onClick={clearForm}>Discard</button>
                  <button type="submit" className="flex-1 py-3 bg-[#1f108e] text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity">{editingId ? 'Update Question' : 'Save Question'}</button>
                </div>
              </form>
            </section>

            <section className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#0b1c30]">Test Questions ({questionCount})</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-[#464553] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"><span className="material-symbols-outlined">filter_list</span></button>
                  <button className="p-2 text-[#464553] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"><span className="material-symbols-outlined">sort</span></button>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" className="p-2 hover:bg-indigo-50 text-[#1f108e] rounded-lg transition-all" title="Edit" onClick={() => handleEditQuestion(question)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button type="button" className="p-2 hover:bg-[#ffdad6] text-[#777584] hover:text-[#ba1a1a] rounded-lg transition-all" title="Delete" onClick={() => handleDeleteQuestion(question.id)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-slate-500">{index + 1}</span>
                      </div>
                      <div className="space-y-4 w-full">
                        <p className="text-lg leading-relaxed text-[#0b1c30] font-medium">{question.text}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {question.options.map((option, optionIndex) => {
                            const isCorrect = question.correctIndex === optionIndex;
                            return (
                              <div key={`${question.id}-${optionIndex}`} className={`flex items-center gap-3 p-3 rounded-lg border ${isCorrect ? 'bg-[#86f2e4]/10 border-[#86f2e4]' : 'bg-[#f8f9ff] border-slate-100'}`}>
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${isCorrect ? 'bg-[#006a61] text-white' : 'bg-slate-200 text-slate-700'}`}>{String.fromCharCode(65 + optionIndex)}</span>
                                <span className={`text-sm ${isCorrect ? 'font-semibold' : ''}`}>{option}</span>
                                {isCorrect && <span className="ml-auto material-symbols-outlined text-[#006a61] text-sm">check_circle</span>}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-50 text-xs font-medium text-[#464553]">
                          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">history</span>{question.editedAt}</div>
                          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">groups</span>{question.accuracyRate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center pt-4">
                <button type="button" className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-[#464553] font-semibold rounded-lg hover:bg-white hover:border-[#1f108e] hover:text-[#1f108e] transition-all">
                  <span className="material-symbols-outlined">expand_more</span>
                  Load More Questions
                </button>
              </div>
            </section>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
            {[
              { label: 'Avg. Time', value: '45m 20s', icon: 'timer', iconColor: 'text-[#1f108e]', bg: 'bg-indigo-50' },
              { label: 'Pass Rate', value: '78.4%', icon: 'trending_up', iconColor: 'text-[#006a61]', bg: 'bg-teal-50' },
              { label: 'Critical Items', value: '3', icon: 'priority_high', iconColor: 'text-[#ba1a1a]', bg: 'bg-red-50' },
              { label: 'Difficulty', value: 'Medium', icon: 'star', iconColor: 'text-orange-500', bg: 'bg-orange-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-[#0b1c30]">{stat.value}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50">
          <button className="flex flex-col items-center gap-1 text-slate-400" onClick={() => navigate('/teacher-dashboard')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#1f108e]">
            <span className="material-symbols-outlined">quiz</span>
            <span className="text-[10px] font-bold">Manage</span>
          </button>
        </nav>

        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeDeleteDialog}>
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0b1c30]">Delete Question?</h3>
                  <p className="text-sm text-[#464553] mt-2">Are you sure you want to delete this question? This action cannot be undone.</p>
                </div>
                <button type="button" className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" onClick={closeDeleteDialog} aria-label="Close delete dialog">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" onClick={closeDeleteDialog}>Cancel</button>
                <button type="button" className="px-5 py-2.5 text-sm font-semibold bg-[#ba1a1a] text-white rounded-lg hover:opacity-90 transition-opacity" onClick={confirmDelete}>Delete Question</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}