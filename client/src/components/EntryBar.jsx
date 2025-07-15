import React, { useState } from 'react';
import { Form, Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import parseEntryStub from '../utils/parseEntryStub';

function EntryBar() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setParsed(parseEntryStub(value));
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Form.Control
            type="text"
            placeholder="Enter transaction (e.g., > 150 chai from HDFC)"
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
