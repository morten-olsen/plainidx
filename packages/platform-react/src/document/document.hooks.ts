import { useCallback, useContext, useEffect, useState } from 'react';
import { DocumentContext } from './document.context.js';
import { usePlainDB } from '../plaindb/plaindb.hooks.js';

const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }

  return context.document;
};

const useDocumentRenders = () => {
  const { editor } = usePlainDB();
  const document = useDocument();

  const [current, setCurrent] = useState(editor.renders.getByDocument(document));

  useEffect(() => {
    const listen = () => {
      setCurrent(editor.renders.getByDocument(document));
    };
    editor.renders.on('change', listen);
    return () => {
      editor.renders.off('change', listen);
    };
  }, [editor.renders, document, setCurrent]);

  return current;
};

const useDocumentValue = () => {
  const document = useDocument();
  const [current, setCurrent] = useState(document.data);

  const setValue = useCallback(
    (newValue: Buffer) => {
      document.data = newValue;
    },
    [document],
  );

  useEffect(() => {
    const listen = () => {
      setCurrent(document.data);
    };
    document.on('change', listen);
    return () => {
      document.off('change', listen);
    };
  }, [document, setCurrent]);

  return [current, setValue] as const;
};

export { useDocument, useDocumentValue, useDocumentRenders };
