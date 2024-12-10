import { useContext } from 'react';
import { PlainDBContext } from './plaindb.context.js';

const usePlainDB = () => {
  const context = useContext(PlainDBContext);
  if (context === undefined) {
    throw new Error('usePlainDB must be used within a PlainDBProvider');
  }
  return context;
};

export { usePlainDB };
