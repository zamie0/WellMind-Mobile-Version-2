import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, Sparkles, Stethoscope, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { UserRole } from '@/types/auth';

const Auth = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, login } = useAuthStore();

  const isCounselor = role === 'counselor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    if (isLogin) {
      const result = await login(email, password, role);
      if (result.success) {
        toast.success(isCounselor ? 'Welcome back, Counselor 💚' : 'Welcome back! 🌿');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } else {
      const result = await register(email, password, role);
      if (result.success) {
        toast.success(
          isCounselor
            ? 'Counselor account created! 🌱'
            : 'Account created! Welcome to WellMind 🌱'
        );
      } else {
        toast.error(result.error || 'Registration failed');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream-100 flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-sage-200/30 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-32 right-10 w-40 h-40 bg-coral-200/20 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sage-400 to-sage-500 rounded-3xl shadow-lg mb-4"
          >
            <img 
              src="/logo_removed_bg.png" 
              alt="Logo" 
              className="w-20 h-20 object-contain"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-sage-800 mb-2">WellMind</h1>
          <p className="text-sage-600">Your mental wellness companion</p>
        </motion.div>

        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-sage-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                role === 'user'
                  ? 'border-[hsl(var(--sage))] bg-[hsl(var(--sage-light))] shadow-md scale-[1.03]'
                  : 'border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--sage))]'
              }`}
            >
              <Users className={`w-5 h-5 mb-2 ${role === 'user' ? 'text-sage-600' : 'text-sage-400'}`} />
              <p className="font-semibold text-sage-800 text-sm">I'm a User</p>
              <p className="text-xs text-sage-500 mt-0.5">Seeking support</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('counselor');
                setIsLogin(true);
              }}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                role === 'counselor'
                  ? 'border-[hsl(var(--coral))] bg-[hsl(var(--coral-light))] shadow-md scale-[1.03]'
                  : 'border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--coral))]'
              }`}
            >
              <Stethoscope className={`w-5 h-5 mb-2 ${role === 'counselor' ? 'text-coral-600' : 'text-sage-400'}`} />
              <p className="font-semibold text-sage-800 text-sm">I'm a Counselor</p>
              <p className="text-xs text-sage-500 mt-0.5">Providing support</p>
            </button>
          </div>

          {/* Toggle */}
          <AnimatePresence mode="wait">
            {isCounselor ? (
              <motion.div
                key="counselor-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-coral-50 border border-coral-200"
              >
                <Stethoscope className="w-5 h-5 text-coral-500 shrink-0" />
                <div>
                  <p className="font-semibold text-coral-800 text-sm">Counselor Login</p>
                  <p className="text-xs text-coral-500">Access your counselor dashboard</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="user-toggle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="relative flex bg-[hsl(var(--sage-light))] rounded-full p-1 mb-6"
              >
                <div
                  className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-[hsl(var(--sage))] transition-all duration-300 ${
                    isLogin ? 'left-1' : 'left-[calc(50%-4px)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="relative z-10 flex-1 py-2 text-sm font-semibold"
                >
                  <span className={isLogin ? 'text-white' : 'text-[hsl(var(--sage-dark))]'}>
                    Login
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="relative z-10 flex-1 py-2 text-sm font-semibold"
                >
                  <span className={!isLogin ? 'text-white' : 'text-[hsl(var(--sage-dark))]'}>
                    Register
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 py-6 rounded-xl border-sage-200 focus:border-sage-400 bg-white"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 py-6 rounded-xl border-sage-200 focus:border-sage-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 py-6 rounded-xl border-sage-200 focus:border-sage-400 bg-white"
                    />
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-6 rounded-xl text-white font-semibold shadow-lg ${
                isCounselor
                  ? 'bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700'
                  : 'bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700'
              }`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : isLogin ? (
                isCounselor ? 'Sign in as Counselor' : 'Welcome Back'
              ) : isCounselor ? (
                'Counselor Registration Disabled'
              ) : (
                'Start Your Journey'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
