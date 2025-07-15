import React, { useState } from 'react';
import { Form, Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import parseEntryStub from '../utils/parseEntryStub';
import usePinnedContextStore from '../store/usePinnedContextStore';

function EntryBar() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);

  const pinContext = usePinnedContextStore((state) => state.pinContext);
  const unpinAll = usePinnedContextStore((state) => state.unpinAll);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Detect pin/unpin commands
    if (/^pin from/i.test(value)) {
      const match = value.match(/^pin from (\w+)/i);
      if (match) pinContext({ account: match[1] });
      setParsed(null);
    } else if (/^unpin all/i.test(value)) {
      unpinAll();
      setParsed(null);
    } else {
      setParsed(parseEntryStub(value));
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Form.Control
            type="text"
            // TODO: Add example usage
            placeholder="Enter transaction or pin (e.g., pin from HDFC)"
            value={input}
            onChange={handleChange}
            className="mb-3"
          />
          {parsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-muted"
            >
              {`${parsed.type} | ₹${parsed.amount} | ${parsed.account} | ${parsed.note}`}
            </motion.div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default EntryBar;
