import { Document } from '@plainidx/plainidx';
import React from 'react';

type DocumentContextType = {
  document: Document;
};

const DocumentContext = React.createContext<DocumentContextType | undefined>(undefined);

export { DocumentContext };
