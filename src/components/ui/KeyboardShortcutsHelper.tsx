import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
export function KeyboardShortcutsHelper() {
  const {
    showHelper,
    setShowHelper,
    shortcuts
  } = useKeyboardShortcuts();
  // Filter out Escape as it's a utility key mostly
  const displayShortcuts = shortcuts.filter(s => s.key !== 'Escape');
  return <AnimatePresence>
      {showHelper && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-rose-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-serif font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowHelper(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2">
              <div className="grid gap-1">
                {displayShortcuts.map((shortcut, index) => <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.ctrlKey && <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                          Ctrl
                        </kbd>}
                      {shortcut.shiftKey && <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                          Shift
                        </kbd>}
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 min-w-[24px] text-center uppercase">
                        {shortcut.key}
                      </kbd>
                    </div>
                  </div>)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center text-xs text-gray-500">
              Press <kbd className="font-bold">Esc</kbd> to close this window
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}