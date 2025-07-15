import React from 'react';
import { ListGroup, Button, Container } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import useEntryLogStore from '../store/useEntryLogStore';

function RecentEntryList() {
  const entries = useEntryLogStore((state) => state.entries);
  const removeEntryById = useEntryLogStore((state) => state.removeEntryById);

  return (
    <Container>
      <h5 className="mt-4">Recent Entries</h5>
      <ListGroup>
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{entry.type}</strong> · ₹{entry.amount} · {entry.account} · {entry.note}
              </div>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => removeEntryById(entry.id)}
              >
                Undo
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ListGroup>
    </Container>
  );
}

export default RecentEntryList;
