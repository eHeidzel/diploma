import { useWindowSize } from "./useWindowSize";

export const useAdaptiveLevel = () => {
  const { width } = useWindowSize();

  const getTitleLevel = (baseLevel: number): 1 | 2 | 3 | 4 | 5 => {
    let level = baseLevel;

    if (width < 480) level = Math.min(5, baseLevel + 2);
    else if (width < 768) level = Math.min(5, baseLevel + 1);
    else if (width >= 1200) level = Math.min(5, baseLevel);

    return level as 1 | 2 | 3 | 4 | 5;
  };

  return { getTitleLevel, width };
};
