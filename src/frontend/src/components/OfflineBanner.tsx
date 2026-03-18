import { Wifi, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
      setShowBackOnline(false);
    }

    function handleOnline() {
      setIsOffline(false);
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-body"
        >
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>You're offline — showing cached data</span>
        </motion.div>
      )}
      {showBackOnline && !isOffline && (
        <motion.div
          key="back-online"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg bg-green-50 border border-green-200 text-green-800 text-sm font-body"
        >
          <Wifi className="h-4 w-4 flex-shrink-0" />
          <span>Back online</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
