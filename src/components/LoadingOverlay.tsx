import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

const LoadingOverlay = ({ show = false }: { show: boolean }) => {
  if (!show) return null;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 bg-black/85 z-50"
      aria-hidden="true"
    />
  );
};

export default LoadingOverlay;
