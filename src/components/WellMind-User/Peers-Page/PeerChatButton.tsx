import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';

export const PeerChatButton = () => {
  const handlePeerChat = () => {
    toast.info('Peer Support Chat', {
      description: 'This feature will connect you with trained peer supporters. Coming soon!',
      duration: 4000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-coral/10 to-honey/10 rounded-2xl p-5 border border-coral/20"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-coral/20 flex items-center justify-center">
          <Users className="w-7 h-7 text-coral" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Peer Support Chat
            <Heart className="w-4 h-4 text-coral fill-coral" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Talk to real people who understand
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Connect with trained peer supporters who are here to listen without judgment. 
        Sometimes talking to someone who's been there helps the most.
      </p>

      <Button
        className="w-full bg-coral hover:bg-coral/90 text-white"
        onClick={handlePeerChat}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Find Someone to Talk To
      </Button>
    </motion.div>
  );
};

export default PeerChatButton;
