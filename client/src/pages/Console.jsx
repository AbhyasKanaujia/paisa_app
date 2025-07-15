import React from 'react';

import { motion } from 'framer-motion';

function Console() {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3}}
    >
      Hello Paisa
    </motion.div>
  );
}

export default Console;
