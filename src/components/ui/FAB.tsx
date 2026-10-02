import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { dismissNotice } from '@/lib/uiNotice';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => { dismissNotice(); onClick(); }}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-primary-700 text-white shadow-lg shadow-primary-600/30 transition-transform active:scale-90 md:bottom-6 md:right-8"
      aria-label="Adicionar transação"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </motion.button>
  );
}
