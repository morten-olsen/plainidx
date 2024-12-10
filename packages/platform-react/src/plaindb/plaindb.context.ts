import { Editor, PlainDB } from '@plainidx/plainidx';
import React from 'react';

type PlainDBContextType = {
  db: PlainDB;
  editor: Editor;
};

const PlainDBContext = React.createContext<PlainDBContextType | undefined>(undefined);

export { PlainDBContext };
