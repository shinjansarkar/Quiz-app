import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-indigo-700">QuizFlow</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-[#1f108e] text-sm font-semibold hover:bg-[#1f108e]/5 rounded-lg transition-all"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-4 py-2 bg-[#1f108e] text-white text-sm font-semibold rounded-lg hover:opacity-90 shadow-md transition-all active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Copy */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-1 bg-[#86f2e4]/30 text-[#006f66] px-3 py-1.5 rounded-full text-xs font-bold">
                ✨ New: Advanced Proctoring Features
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#1f108e] tracking-tight leading-tight">
              Master your learning with <span className="text-[#006a61]">effortless flow.</span>
            </h1>
            <p className="text-lg text-[#464553] max-w-lg leading-relaxed">
              QuizFlow transforms the testing experience into a focused journey. Designed for clarity, academic integrity, and distraction-free progress.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => navigate('/signup')} 
                className="px-8 py-3 bg-[#1f108e] text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Register Yourself
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-8 py-3 border-2 border-[#1f108e] text-[#1f108e] font-bold rounded-xl hover:bg-[#1f108e]/5 active:scale-95 transition-all"
              >
                Login
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex -space-x-3">
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDpkOEkaBKKh1xqCwS5fQTRqLbfKPQ1dJknMpEe3CiyvFSUcprkIYbtGHOirSpsCADP8xyG2I4CmmsL6Eb3ZMZ3GhELZkG8FZZpK7c9euUrhCvaNUZ_RJh88QsnG1ZoHjTrjfTND4EgiQ-OLLSmHOvG3Ul5mDcgOfNeZUogsPbFyCHqX2y7MNnQvToalZT-V1JMcuwRakafw3UbLyxQHpb8o7RQwdC41CeS9OOeiwJK4iDTCcAO6wOA3-pChR9Cfo7FaipsJL9UPtj" alt="User 1" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJZTKpdgIvHYgJw2krAu0TzXHMxp1-NAE0EblBxd1HtuOz-RmFlpFjI8zhfkPo94w_vuQhFBalLYNxgtEbm_zVtMpAb6e62UCSaeVjV5kRJBO78Pzjgyzo6dslY-ssPpw8-Yg02xT4RLJOEXmVxvjruevipEikk0uLP86xa23g_3otLbD946gCFrOefBQxBBz0Ljk7EO0J_gsawpJbDNX-Qj1nUGPwIsCnOlJpURXGwYCGiVmXC58HNZtLMibnKvqp-ZhwifCqSTJ-" alt="User 2" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbNe5-INFnjKRwPNR3Q77h-1A4Lmb-TODUf06JjSKT3S3XnSY4LHdWz6qZjIH1UdIDkEN95k2lQAknVuNYzVBEaPK8srTIvIjMkolBS6cKv29xOz8aehykk9qgdCzb5vF1mfyBQmAJyesGMLXLQUtuetkzdsrTJ_Ec3ZQK6vwU-Jb7pV4HFqNjbCKQxeFrJSitsB_IK-474nlbtoON6xt8Vt2k2IooeYa9z_xgVqgAa1JD86EXbtp4nZXo29YrNXtyH0S7nNpPJc6R" alt="User 3" />
              </div>
              <span className="text-xs font-semibold text-[#464553]">
                Join <strong className="text-[#1f108e]">12,000+</strong> educators and students today.
              </span>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative grid grid-cols-12 gap-4 bg-[#eff4ff]/50 p-6 rounded-3xl border border-slate-100 shadow-inner">
            {/* Physics 101 Card */}
            <div className="col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30]">Physics 101</h3>
                  <p className="text-xs text-[#777584]">Midterm Examination</p>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">In Progress</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-sm font-semibold text-[#0b1c30]">Newton's Laws of Motion</span>
                  <span className="material-symbols-outlined text-indigo-700 font-bold text-sm">check</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-sm font-semibold text-[#464553]">Quantum Mechanics Basics</span>
                  <span className="w-4 h-4 border border-slate-300 rounded-full"></span>
                </div>
              </div>

              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-[#006a61] rounded-full"></div>
              </div>
            </div>

            {/* Timer Card */}
            <div className="col-span-4 bg-[#1f108e] text-white p-6 rounded-2xl flex flex-col justify-between items-center text-center shadow-md">
              <span className="material-symbols-outlined text-2xl">schedule</span>
              <div>
                <span className="text-2xl font-extrabold block">45:00</span>
                <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Remaining</span>
              </div>
            </div>

            {/* High Score Card */}
            <div className="col-span-7 bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-md">
              <div className="p-3 bg-[#86f2e4]/20 text-[#006a61] rounded-xl">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1f108e]">New High Score!</h4>
                <p className="text-[10px] text-[#464553]">You've reached the Top 5% this week.</p>
              </div>
            </div>

            {/* Class Avg Card */}
            <div className="col-span-5 bg-[#e5eeff] text-[#1f108e] p-4 rounded-2xl flex items-center gap-3 border border-[#c3c0ff]/50 shadow-md">
              <div className="p-2 bg-white text-[#1f108e] rounded-lg">
                <span className="material-symbols-outlined text-sm">bar_chart</span>
              </div>
              <div>
                <span className="text-lg font-extrabold block">94%</span>
                <span className="text-[10px] text-[#464553] font-semibold">Class Avg</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[#f0f4ff]/40 border-y border-slate-200/50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1f108e] mb-2 tracking-tight">
              Precision tools for modern education
            </h2>
            <p className="text-[#464553] max-w-2xl mx-auto text-base md:text-lg mb-12 md:mb-16">
              We've stripped away the noise to leave only what matters: clear questions, meaningful insights, and a focus on growth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start text-left hover:-translate-y-1 transition-all">
                <div className="p-3 bg-[#e2dfff] text-[#1f108e] rounded-xl mb-6">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Timed Quizzes</h3>
                <p className="text-sm text-[#464553] leading-relaxed">
                  Maintain focus with intelligent timer controls. Automatic submissions and segment-level pacing ensure fair and consistent assessment for everyone.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start text-left hover:-translate-y-1 transition-all">
                <div className="p-3 bg-[#86f2e4]/30 text-[#006f66] rounded-xl mb-6">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Instant Feedback</h3>
                <p className="text-sm text-[#464553] leading-relaxed">
                  Don't wait to learn. Get granular feedback immediately after submission with detailed explanations for every correct and incorrect choice.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start text-left hover:-translate-y-1 transition-all">
                <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl mb-6">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Teacher Analytics</h3>
                <p className="text-sm text-[#464553] leading-relaxed">
                  Comprehensive dashboard for educators. Track class performance trends, identify common misconceptions, and generate automated grading reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="bg-[#1f108e] text-white p-8 md:p-16 rounded-3xl relative overflow-hidden flex flex-col items-center text-center">
            {/* Abstract Background Circles */}
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[-30%] left-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-2xl"></div>

            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 relative z-10">
              Ready to elevate your assessment game?
            </h2>
            <p className="text-sm md:text-lg opacity-90 max-w-xl mb-8 md:mb-10 relative z-10 leading-relaxed">
              Start building high-integrity quizzes today. Join thousands of students and teachers who trust QuizFlow for their academic journey.
            </p>
            
            <div className="flex flex-wrap gap-4 relative z-10">
              <button 
                onClick={() => navigate('/signup')} 
                className="px-8 py-3 bg-[#86f2e4] text-[#00201d] font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Get Started for Free
              </button>
              <button className="px-8 py-3 border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white/10 active:scale-95 transition-all">
                Request a Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold tracking-tight text-indigo-700">QuizFlow</span>
            <p className="text-xs text-[#464553] leading-relaxed max-w-xs">
              Designing the future of academic assessment with trust and clarity at the core.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#1f108e] uppercase tracking-wider">Platform</h4>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Features</a>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Integrations</a>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Pricing</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#1f108e] uppercase tracking-wider">Company</h4>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">About Us</a>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Contact</a>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Blog</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#1f108e] uppercase tracking-wider">Legal</h4>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Privacy Policy</a>
            <a className="text-xs text-[#464553] hover:text-[#1f108e] transition-colors cursor-pointer">Terms of Service</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 pt-6 flex justify-between items-center text-xs text-[#777584]">
          <span>© 2024 QuizFlow Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-base">language</span>
            <span className="material-symbols-outlined text-base">share</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
