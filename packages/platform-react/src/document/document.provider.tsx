import React from 'react';
import { Document } from '@plainidx/plainidx';
import { DocumentContext } from './document.context.js';

type DocumentProviderProps = {
  document: Document;
  children: React.ReactNode;
};

const DocumentProvider = ({ document, children }: DocumentProviderProps) => {
  return <DocumentContext.Provider value={{ document }}>{children}</DocumentContext.Provider>;
};

export { DocumentProvider };
