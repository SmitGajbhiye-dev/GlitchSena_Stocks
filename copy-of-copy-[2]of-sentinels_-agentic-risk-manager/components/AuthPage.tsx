import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

interface AuthPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        // App.tsx listener handles the state update
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Optional: Update display name
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        // App.tsx listener handles state
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
         setError("Password or email incorrect");
      } else if (err.code === 'auth/email-already-in-use') {
         setError("User already exists. Sign in?");
      } else {
         setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // App.tsx listener handles state
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-0 md:p-4 font-sans">
      <div className="w-full max-w-5xl bg-gray-900 md:border border-gray-800 md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col md:flex-row h-screen md:h-[600px]">
        
        {/* Left Side: Brand & Visuals (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-between w-full md:w-1/2 p-10 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
           
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/50">
                   <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">SENTINEL <span className="text-emerald-500">INDIA</span></h1>
             </div>
             
             <div className="space-y-6 mt-12">
               <h2 className="text-3xl font-bold text-gray-100 leading-tight">
                 Autonomous Risk Management for Modern Investors.
               </h2>
               <p className="text-gray-400 text-lg">
                 Deploy AI agents to monitor your NSE/BSE portfolio 24/7. Get real-time alerts, strategic insights, and detailed peer comparisons.
               </p>
             </div>
           </div>

           <div className="relative z-10 flex gap-2 text-xs text-gray-500 font-mono">
             <span>Gemini Pro 3</span> • <span>Real-time Market Data</span> • <span>Bank Grade Security</span>
           </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 bg-gray-900 flex flex-col justify-center relative h-full">
          
          {/* Mobile Only Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/50 mb-3">
               <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">SENTINEL <span className="text-emerald-500">INDIA</span></h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">AI RISK MANAGER</p>
          </div>

          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-gray-400 mb-8 text-sm">
              {isLogin ? 'Enter your credentials to access your agent dashboard.' : 'Start your journey towards smarter risk management.'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-950/30 border border-rose-800 text-rose-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
                {error.includes("already exists") && !isLogin && (
                   <button onClick={toggleMode} className="underline font-bold ml-1 hover:text-white">Sign In now</button>
                )}
              </div>
            )}

            {/* Google Button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors mb-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-600" /> : <Chrome className="w-5 h-5 text-blue-600" />}
              <span>Continue with Google</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                   <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                   <input 
                     type="text" 
                     placeholder="Full Name" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-gray-500 transition-all"
                     required={!isLogin}
                   />
                </div>
              )}

              <div className="relative">
                 <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                 <input 
                   type="email" 
                   placeholder="Email Address" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-gray-500 transition-all"
                   required
                 />
              </div>

              <div className="relative">
                 <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                 <input 
                   type="password" 
                   placeholder="Password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-gray-500 transition-all"
                   required
                 />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button 
                onClick={toggleMode}
                className="ml-2 text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;