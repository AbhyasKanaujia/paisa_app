import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Alert } from 'react-bootstrap';
import usePinnedContextStore from '../store/usePinnedContextStore';

function PinnedContextBar() {
  const { pinnedAccount, pinnedTags } = usePinnedContextStore();

  const hasPinned = pinnedAccount || (pinnedTags && pinnedTags.length > 0);

  return (
    <AnimatePresence>
      {hasPinned && (
        <motion.div
          key="pinnedBar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Container>
            <Alert variant="secondary" className="py-2 px-3 mb-3">
              📌&nbsp;
              {pinnedAccount && <span><strong>{pinnedAccount}</strong></span>}
              {pinnedTags.length > 0 && (
                <span className="ms-2">
                  {pinnedTags.map((tag, idx) => (
                    <span key={idx} className="badge bg-info text-dark me-1">#{tag}</span>
                  ))}
                </span>
              )}
            </Alert>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PinnedContextBar;
