import React from 'react';
import { usePanel } from './panels.hooks.js';

type PanelProps = {
  id: string;
};

const Panel = ({ id }: PanelProps) => {
  const panel = usePanel(id);

  if (!panel) {
    return null;
  }

  const Component = panel.component;
  return <Component />;
};

export { Panel };
