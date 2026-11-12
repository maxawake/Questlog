import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** Icon path definitions ported 1:1 from questlog/dist/app.js's `paths` map. */
const icons: Record<string, React.ReactNode> = {
  compass: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
    </>
  ),
  sword: (
    <>
      <Path d="m14 3 7-1-1 7L9 20l-5-5Z" />
      <Path d="m3 13 8 8M4 20l-2 2M14 3l6 6" />
    </>
  ),
  spark: <Path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />,
  book: (
    <>
      <Path d="M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V5a2 2 0 0 1 1-2Z" />
      <Path d="M3 17h17M8 7h7M8 11h5" />
    </>
  ),
  flag: <Path d="M5 22V3c5-5 9 5 15 0v11c-6 5-10-5-15 0" />,
  check: <Path d="m5 12 4 4L19 6" />,
  circleCheck: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="m8 12 3 3 5-6" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <Circle cx={10.5} cy={10.5} r={6.5} />
      <Path d="m16 16 5 5" />
    </>
  ),
  arrow: <Path d="M4 12h16m-5-5 5 5-5 5" />,
  chevron: <Path d="m9 5 7 7-7 7" />,
  down: <Path d="m6 9 6 6 6-6" />,
  close: <Path d="m6 6 12 12M6 18 18 6" />,
  users: (
    <>
      <Circle cx={9} cy={8} r={3} />
      <Path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" />
    </>
  ),
  calendar: (
    <>
      <Rect x={3} y={5} width={18} height={16} rx={2} />
      <Path d="M7 2v6m10-6v6M3 11h18" />
    </>
  ),
  leaf: <Path d="M20 3C7 1 1 8 6 17c9 5 16-1 14-14ZM3 21 16 8" />,
  settings: (
    <>
      <Circle cx={12} cy={12} r={4} />
      <Path d="m10 2-.5 3-2 1-3-.5-2 3 2 2v3l-2 2 2 3 3-.5 2 1 .5 3h4l.5-3 2-1 3 .5 2-3-2-2v-3l2-2-2-3-3 .5-2-1-.5-3Z" />
    </>
  ),
  refresh: <Path d="M20 7a9 9 0 1 0 1 8M20 2v6h-6" />,
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  edit: <Path d="m16 3 5 5L8 21H3v-5Zm-2 2 5 5" />,
  menu: <Path d="M4 6h16M4 12h16M4 18h16" />,
  cloud: <Path d="M7 18a5 5 0 1 1 1-10 7 7 0 0 1 13 4 3 3 0 0 1-1 6Z" />,
  download: <Path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  shield: (
    <>
      <Path d="m12 2 8 3v7c0 6-8 10-8 10S4 18 4 12V5Z" />
      <Path d="m8 11 3 3 5-5" />
    </>
  ),
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.65 }: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name] ?? icons.spark}
    </Svg>
  );
}
