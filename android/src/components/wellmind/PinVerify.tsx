import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuthStore } from '@/stores/authStore';

const PinVerify = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  
  const { verifyPin, logout, getCurrentUser } = useAuthStore();
  const user = getCurrentUser();

  const handlePinChange = (value: string) => {
    setError('');
    setPin(value);
    
    if (value.length === 6) {
      const success = verifyPin(value);
      if (!success) {
        setAttempts(prev => prev + 1);
        setError(attempts >= 2 ? 'Too many attempts. Try logging in again.' : 'Incorrect PIN. Try again.');
        setPin('');
        
        if (attempts >= 4) {
          logout();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream-100 flex flex-col items-center justify-center p-6">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-sage-200/30 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-32 right-10 w-40 h-40 bg-coral-200/20 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sage-400 to-sage-500 rounded-3xl shadow-lg mb-6"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Heart className="w-10 h-10 text-white" fill="currentColor" />
        </motion.div>

        <h1 className="text-2xl font-bold text-sage-800 mb-2">Welcome Back!</h1>
        <p className="text-sage-600 mb-8">
          Enter your PIN to continue
        </p>

        {/* User email hint */}
        {user && (
          <p className="text-sage-500 text-sm mb-6">
            {user.email}
          </p>
        )}

        {/* PIN Input */}
        <motion.div
          key={attempts}
          initial={{ x: attempts > 0 ? [-10, 10, -10, 10, 0] : 0 }}
          animate={{ x: 0 }}
          className="flex justify-center mb-6"
        >
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={handlePinChange}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="w-12 h-14 text-xl font-bold border-sage-300 rounded-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-coral-500 mb-4"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Numeric keypad visual hint */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`w-3 h-3 rounded-full transition-all ${
                pin.length >= num ? 'bg-sage-500' : 'bg-sage-200'
              }`}
            />
          ))}
        </div>

        {/* Login with password option */}
        <Button
          variant="ghost"
          onClick={logout}
          className="text-sage-500 hover:text-sage-700 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Use password instead
        </Button>

        <p className="text-sage-400 text-xs mt-6">
          Forgot PIN? Log out and use your password
        </p>
      </motion.div>
    </div>
  );
};

export default PinVerify;
