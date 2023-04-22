import { useState } from 'react';

export const useHover = (): { isHovering: boolean; props: { onMouseEnter: () => void; onMouseLeave: () => void } } => {
  const [isHovering, setIsHovering] = useState(false);

  const props = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
  };

  return { isHovering, props };
};
