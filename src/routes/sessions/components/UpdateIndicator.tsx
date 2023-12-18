import { CheckIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

type UpdateIndicatorProps = {
  loading: boolean;
};
export const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({
  loading,
}) => (
  <AnimatePresence>
    {loading && (
      <motion.div
        className="absolute -right-3"
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#595959]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <title>updating...</title>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
    )}
  </AnimatePresence>
);
