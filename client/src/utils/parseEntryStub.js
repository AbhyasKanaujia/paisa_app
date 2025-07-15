export default function parseEntryStub(line) {
  if (!line) return null;

  const type = line.startsWith('<') ? 'Income' : 'Expense';
  const cleaned = line.replace(/^<|>/, '').trim();

  const amountMatch = cleaned.match(/^\d+/);
  const amount = amountMatch ? amountMatch[0] : '0';

  const fromMatch = cleaned.match(/from\s+(\w+)/i);
  const account = fromMatch ? fromMatch[1] : 'Unknown';

  const note = cleaned
    .replace(/^\d+/, '')
    .replace(/from\s+\w+/i, '')
    .trim();

  return {
    type,
    amount,
    account,
    note,
  };
}
