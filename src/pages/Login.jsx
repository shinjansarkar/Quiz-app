import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, parseJwtPayload, setAuthSession } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const auth = await apiRequest('/api/auth/login', {
        method: 'POST',
        authenticated: false,
        body: { identifier, password },
      });

      const payload = parseJwtPayload(auth.accessToken);
      const role = String(auth.role || payload?.role || 'student').toLowerCase();
      const userIdentifier = payload?.sub || identifier;
      const user = {
        identifier: userIdentifier,
        name: auth.username || userIdentifier,
        role,
      };

      setAuthSession({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        user,
      });

      if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-[#0b1c30] min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-16 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#3730a3]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#86f2e4]/20 rounded-full blur-3xl"></div>
      
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Brand Visual Side */}
        <div className="hidden md:flex flex-col justify-between p-8 lg:p-12 bg-[#3730a3] relative overflow-hidden">
          <div className="z-20">
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-white text-[40px]">auto_stories</span>
              <h1 className="text-4xl font-bold text-white tracking-tight">QuizFlow</h1>
            </div>
            <h2 className="text-5xl font-extrabold text-[#e2dfff] mb-4">Master your knowledge with precision.</h2>
            <p className="text-lg text-[#c3c0ff]/80 max-w-md">Experience a distraction-free learning environment designed for academic excellence and professional growth.</p>
          </div>
          <div className="relative z-20 mt-auto">
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg border border-white/10 flex items-center gap-4">
              <img alt="Academic logo" className="w-12 h-12 rounded-full bg-white/20 p-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP3lJM_Sc4Q_ATQJZvH0YhGI5VxTJxSIpKrLAUKqRW2M4CcRYD4hGM_5GvVHImnYD_LQQG4wjnzoofXzJbf1cm0SCB-OkYLlDn_UM2mCdVYu3yQhVzgfOAWJpQV81yNu9bwMUb0hOGOb-MoZdJBK9FAW5BW3R8xCsOaXskQiKwYU0dYHW0HmYjXnokybjHPE24-_rgDnCzbET2eGiXXsquljyCu_7b9tbpipQlmmJwvF3Yi6dvKIcnSm-4Q03xFkq_ka4zoHi6tPk3" />
              <div>
                <p className="text-sm font-semibold text-[#0b1c30]">Join 50k+ Learners</p>
                <p className="text-xs text-[#0b1c30]/70">Trusted by universities worldwide</p>
              </div>
            </div>
          </div>
          {/* Abstract Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
              <path d="M0 100 C 20 0 50 0 100 100" fill="none" stroke="white" strokeWidth="0.1"></path>
              <path d="M0 80 C 30 20 60 20 100 80" fill="none" stroke="white" strokeWidth="0.1"></path>
              <path d="M0 60 C 40 40 70 40 100 60" fill="none" stroke="white" strokeWidth="0.1"></path>
            </svg>
          </div>
        </div>

        {/* Login Form Side */}
        <div className="p-5 sm:p-6 md:p-12 flex flex-col justify-center relative">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-500 hover:text-[#1f108e] text-sm font-bold transition-colors mb-4 self-start"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Home
          </button>

          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <span className="material-symbols-outlined text-[#1f108e] text-[32px]">auto_stories</span>
              <h1 className="text-2xl font-bold text-[#1f108e]">QuizFlow</h1>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] mb-1">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-[#464553]">Please enter your credentials to access your dashboard.</p>
            </div>

            {/* Error State Placeholder */}
            {error && (
              <div id="error-alert" className="mb-6 p-4 bg-[#ffdad6] rounded-lg border border-[#ba1a1a]/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">error</span>
                <p className="text-sm text-[#93000a]">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-[#464553]" htmlFor="identifier">Identifier (Student ID/ Employee ID)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777584]">person</span>
                  <input 
                    className="w-full h-[48px] pl-[48px] pr-4 bg-[#eff4ff] border-none rounded-lg text-base focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all placeholder:text-[#c8c4d5]" 
                    id="identifier" 
                    placeholder="Enter your Identifier" 
                    type="text" 
                    required 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-[#464553]" htmlFor="password">Password</label>
                  <a className="text-xs text-[#1f108e] hover:underline font-semibold" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777584]">lock</span>
                  <input 
                    className="w-full h-[48px] pl-[48px] pr-4 bg-[#eff4ff] border-none rounded-lg text-base focus:ring-2 focus:ring-[#1f108e] focus:bg-white transition-all placeholder:text-[#c8c4d5]" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777584] hover:text-[#0b1c30]" 
                    type="button" 
                    onClick={togglePassword}
                  >
                    <span className="material-symbols-outlined" id="password-icon">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input className="w-5 h-5 rounded border-[#c8c4d5] text-[#1f108e] focus:ring-[#1f108e]" id="remember" type="checkbox" />
                <label className="text-sm text-[#464553]" htmlFor="remember">Remember me for 30 days</label>
              </div>

              {/* CTA Button */}
              <button className="w-full h-[56px] bg-[#1f108e] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#1f108e]/20" type="submit">
                <span>Sign In</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-[#464553]">
                Don't have an account?{' '}
                <a className="text-[#1f108e] font-bold hover:underline cursor-pointer" onClick={() => navigate('/signup')}>Create an account</a>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <footer className="mt-auto pt-8 flex justify-center gap-6 text-xs text-[#777584]">
            <a className="hover:text-[#1f108e] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#1f108e] transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#1f108e] transition-colors" href="#">Contact Support</a>
          </footer>
        </div>
      </main>
    </div>
  );
}
