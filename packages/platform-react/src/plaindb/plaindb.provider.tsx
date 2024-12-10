import React, { useMemo } from 'react';
import { Editor, PlainDB } from '@plainidx/plainidx';
import { PlainDBContext } from './plaindb.context.js';

type PlainDBProviderProps = {
  children: React.ReactNode;
  db: PlainDB;
};

const PlainDBProvider = ({ children, db }: PlainDBProviderProps) => {
  const editor = useMemo(() => {
    const next = new Editor();
    db.plugins.setupUI(editor);
    return next;
  }, [db]);
  return <PlainDBContext.Provider value={{ db, editor }}>{children}</PlainDBContext.Provider>;
};

export { PlainDBProvider };
