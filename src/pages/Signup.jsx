import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');

  const identifierLabel = role === 'teacher' ? 'Emp ID' : 'Student ID';
  const identifierPlaceholder = role === 'teacher' ? 'Enter your employee ID' : 'Enter your student ID';
  const identifierHelpText = role === 'teacher'
    ? "We'll use this to verify your teaching profile."
    : "We'll use this to verify your student profile.";

  const handleSubmit = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('quizflow_users') || '[]');
    if (users.some(u => u.identifier === identifier || u.email === identifier)) {
      alert('ID already registered!');
      return;
    }
    
    const newUser = { name: fullName, identifier, password, role };
    users.push(newUser);
    localStorage.setItem('quizflow_users', JSON.stringify(users));
    localStorage.setItem('quizflow_current_user', JSON.stringify(newUser));
    
    if (role === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const socialSignup = (provider) => {
    const chosenRole = window.confirm(`Sign up as Teacher with ${provider}? (Cancel for Student)`) ? 'teacher' : 'student';
    const name = chosenRole === 'teacher' ? 'Dr. Sarah Miller' : 'Alex Johnson';
    const chosenIdentifier = `${chosenRole}-${provider.toLowerCase()}-001`;
    
    let users = JSON.parse(localStorage.getItem('quizflow_users') || '[]');
    const existing = users.find(u => u.identifier === chosenIdentifier || u.email === chosenIdentifier);
    
    if (!existing) {
      users.push({ name, identifier: chosenIdentifier, role: chosenRole, provider, password: 'password' });
      localStorage.setItem('quizflow_users', JSON.stringify(users));
    }
    
    localStorage.setItem('quizflow_current_user', JSON.stringify({ name, identifier: chosenIdentifier, role: chosenRole }));
    
    if (chosenRole === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex flex-col antialiased">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 w-full flex justify-between items-center px-6 h-16 max-w-7xl mx-auto z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1 text-slate-500 hover:text-[#1f108e] text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <span className="text-xl font-bold tracking-tight text-[#1f108e]">QuizFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <a className="text-[#464553] hover:text-[#1f108e] text-sm font-semibold transition-colors" href="#">Help Center</a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 md:p-16">
        {/* Auth Card Container */}
        <div className="w-full max-w-[520px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 text-center space-y-2 border-b border-slate-50">
            <h1 className="text-3xl font-bold text-[#0b1c30]">Create your account</h1>
            <p className="text-[#464553] text-sm">Join the professional learning community at QuizFlow.</p>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[#0b1c30]" htmlFor="full_name">Full Name</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg bg-[#F1F5F9] border-transparent focus:outline-none focus:border-[#1f108e] focus:bg-white focus:ring-4 focus:ring-[#1f108e]/5 transition-all duration-200 placeholder:text-[#777584]/60" 
                  id="full_name" 
                  placeholder="Enter your full name" 
                  required 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Identifier */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[#0b1c30]" htmlFor="identifier">{identifierLabel}</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg bg-[#F1F5F9] border-transparent focus:outline-none focus:border-[#1f108e] focus:bg-white focus:ring-4 focus:ring-[#1f108e]/5 transition-all duration-200 placeholder:text-[#777584]/60" 
                  id="identifier" 
                  placeholder={identifierPlaceholder}
                  required 
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <p className="text-xs text-[#464553] px-1">{identifierHelpText}</p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[#0b1c30]" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-3 rounded-lg bg-[#F1F5F9] border-transparent focus:outline-none focus:border-[#1f108e] focus:bg-white focus:ring-4 focus:ring-[#1f108e]/5 transition-all duration-200 placeholder:text-[#777584]/60" 
                    id="password" 
                    placeholder="At least 8 characters" 
                    required 
                    type={showPassword ? 'text' : 'password'} 
                    minLength={8} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#c8c4d5] hover:text-[#1f108e]" 
                    type="button" 
                    onClick={togglePassword}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b1c30]">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Student Card */}
                  <label className="relative flex flex-col items-center justify-center p-6 border border-slate-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-indigo-300 group">
                    <input 
                      className="absolute opacity-0" 
                      name="role" 
                      type="radio" 
                      value="student" 
                      checked={role === 'student'} 
                      onChange={() => setRole('student')}
                    />
                    <div className={`absolute inset-0 rounded-lg border-2 transition-all ${role === 'student' ? 'border-[#1f108e] ring-2 ring-[#1f108e]/10 bg-[#1f108e]/5' : 'border-transparent'}`}></div>
                    <span className={`material-symbols-outlined text-3xl mb-2 transition-colors ${role === 'student' ? 'text-[#1f108e]' : 'text-slate-400 group-hover:text-indigo-500'}`}>school</span>
                    <span className="text-sm font-semibold text-[#0b1c30]">Student</span>
                  </label>
                  {/* Teacher Card */}
                  <label className="relative flex flex-col items-center justify-center p-6 border border-slate-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-indigo-300 group">
                    <input 
                      className="absolute opacity-0" 
                      name="role" 
                      type="radio" 
                      value="teacher" 
                      checked={role === 'teacher'} 
                      onChange={() => setRole('teacher')}
                    />
                    <div className={`absolute inset-0 rounded-lg border-2 transition-all ${role === 'teacher' ? 'border-[#1f108e] ring-2 ring-[#1f108e]/10 bg-[#1f108e]/5' : 'border-transparent'}`}></div>
                    <span className={`material-symbols-outlined text-3xl mb-2 transition-colors ${role === 'teacher' ? 'text-[#1f108e]' : 'text-slate-400 group-hover:text-indigo-500'}`}>co_present</span>
                    <span className="text-sm font-semibold text-[#0b1c30]">Teacher</span>
                  </label>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full h-12 bg-[#1f108e] text-white text-sm font-semibold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2" type="submit">
                <span>Create Account</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            {/* Footer Links */}
            <div className="pt-4 text-center space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-px bg-slate-200 flex-grow"></div>
                <span className="text-xs text-[#777584] px-2">OR REGISTER WITH</span>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200 text-sm font-semibold" 
                  onClick={() => socialSignup('Google')}
                >
                  <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJH1agQo1duI5TZnfyGSo3jrpDtxkHO8NebiteGHWe2gT_KFlCLm_qz_DKnkLyyPk6UrWoulnLxZotQF3O4qKIC0_2LVOs8kNYKiO8-P2XsmPnOEMBFQMLiSq2pnujrKYS0qBLfzNNMRG2jzYpygoo8Z4St2ap-loHSVsRjMsbPzDoIjKD5zGLpEAuG8aeVHWFmUfxJXJwHKUQb6za-uvuETN4i-lvOgw3JMWkBbH3sHhMxbkWHelzmWDazTXsGv7_dJALXzwqNnQW" />
                  Google
                </button>
                <button 
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200 text-sm font-semibold" 
                  onClick={() => socialSignup('University')}
                >
                  <span className="material-symbols-outlined text-[#0b1c30]">account_balance</span>
                  University ID
                </button>
              </div>
              <p className="text-sm text-[#464553] pt-4">
                Already have an account?{' '}
                <a className="text-[#1f108e] font-semibold hover:underline cursor-pointer" onClick={() => navigate('/login')}>Log in here</a>
              </p>
            </div>
          </div>

          {/* Trust Indicator */}
          <div className="bg-[#eff4ff] px-6 py-4 flex items-center justify-center gap-2 border-t border-slate-100">
            <span className="material-symbols-outlined text-[#006a61] text-sm">verified_user</span>
            <span className="text-xs text-[#006a61] font-medium">Enterprise Grade Data Protection</span>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="p-6 max-w-7xl mx-auto w-full text-center">
        <p className="text-xs text-[#c8c4d5]">© 2024 QuizFlow Academic Learning Portal. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-[#777584]">
          <a className="hover:text-[#1f108e]" href="#">Privacy Policy</a>
          <span>•</span>
          <a className="hover:text-[#1f108e]" href="#">Terms of Service</a>
        </div>
      </footer>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#1f108e]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#006a61]/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
