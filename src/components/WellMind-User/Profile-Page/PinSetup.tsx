import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface PinSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const PinSetup = ({ onComplete, onSkip }: PinSetupProps) => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  
  const { setupPin } = useAuthStore();

  const handlePinChange = (value: string) => {
    setError('');
    if (step === 'create') {
      setPin(value);
      if (value.length === 6) {
        setTimeout(() => setStep('confirm'), 300);
      }
    } else {
      setConfirmPin(value);
      if (value.length === 6) {
        if (value === pin) {
          const success = setupPin(value);
          if (success) {
            toast.success('PIN set up successfully! 🔐');
            onComplete();
          } else {
            setError('Failed to set up PIN');
          }
        } else {
          setError('PINs do not match. Try again.');
          setConfirmPin('');
          setTimeout(() => setStep('create'), 1500);
          setPin('');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream-100 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sage-400 to-sage-500 rounded-3xl shadow-lg mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-sage-800 mb-2">
          {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
        </h1>
        <p className="text-sage-600 mb-8">
          {step === 'create' 
            ? 'Set a 6-digit PIN for quick access' 
            : 'Enter your PIN again to confirm'}
        </p>

        {/* PIN Input */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 'create' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-center mb-6"
        >
          <InputOTP
            maxLength={6}
            value={step === 'create' ? pin : confirmPin}
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

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full transition-all ${step === 'create' ? 'bg-sage-500' : 'bg-sage-300'}`} />
          <div className={`w-3 h-3 rounded-full transition-all ${step === 'confirm' ? 'bg-sage-500' : 'bg-sage-300'}`} />
        </div>

        {/* Skip button */}
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-sage-500 hover:text-sage-700"
          >
            Skip for now
          </Button>
        )}

        <p className="text-sage-500 text-sm mt-6">
          You'll use this PIN to quickly unlock the app
        </p>
      </motion.div>
    </div>
  );
};

export default PinSetup;
