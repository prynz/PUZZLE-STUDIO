import { SvgXml } from 'react-native-svg';

import { icon } from '../illustrations/svg.ts';

export type NavIconName = 'home' | 'create' | 'collection' | 'awards';
export type GlyphIconName =
  | 'back'
  | 'forward'
  | 'pause'
  | 'eye'
  | 'lock'
  | 'sort'
  | 'rotate'
  | 'trash'
  | 'minus'
  | 'plus'
  | 'hint'
  | 'camera'
  | 'gallery'
  | 'sample';

export type IconProps =
  { name: NavIconName; active?: boolean; size?: number } | { name: GlyphIconName; active?: never; size?: number };

const NAV = new Set<string>(['home', 'create', 'collection', 'awards']);

/** Custom two-tone icons from the shared illustration set (no icon font). Decorative by default. */
export function Icon(props: IconProps) {
  const { name, size } = props;
  const xml = NAV.has(name) ? icon[name as NavIconName](props.active ?? false) : icon[name as GlyphIconName]();
  const s = size ?? (name === 'camera' || name === 'gallery' || name === 'sample' ? 56 : NAV.has(name) ? 30 : 22);
  return <SvgXml xml={xml} width={s} height={s} accessible={false} />;
}
