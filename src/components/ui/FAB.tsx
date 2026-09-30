import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  const isHome = useLocation().pathname === '/dashboard';
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`fixed ${isHome ? 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]'} right-4 md:bottom-6 md:right-8 z-30 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center active:scale-90 transition-transform`}
      aria-label="Adicionar transação"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </motion.button>
  );
}
