import { useEffect, useState } from 'react';
import { usePlainDB } from '../plaindb/plaindb.hooks.js';

const usePanel = (id: string) => {
  const { editor } = usePlainDB();
  const [panel, setPanel] = useState(editor.panels.get(id));

  useEffect(() => {
    const update = () => {
      setPanel(editor.panels.get(id));
    };
    editor.panels.on('change', update);
    return () => {
      editor.panels.off('change', update);
    };
  }, [editor, id]);

  return panel;
};

export { usePanel };
