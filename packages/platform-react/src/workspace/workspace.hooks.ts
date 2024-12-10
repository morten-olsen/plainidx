import { useCallback, useEffect, useState } from 'react';
import { usePlainDB } from '../plaindb/plaindb.hooks.js';

const useOpenDocument = () => {
  const { editor, db } = usePlainDB();
  const open = useCallback(
    async (location: string) => {
      const document = await db.documents.get(location);
      editor.workspace.openDocument(document);
    },
    [editor, db],
  );

  return open;
};

const useDocuments = () => {
  const { editor } = usePlainDB();
  const [documents, setDocuments] = useState(editor.workspace.documents);

  useEffect(() => {
    const update = () => {
      setDocuments(editor.workspace.documents);
    };

    editor.workspace.on('change', update);
    return () => {
      editor.workspace.off('change', update);
    };
  });

  return documents;
};

export { useOpenDocument, useDocuments };
