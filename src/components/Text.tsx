import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import type { TextColors } from '~/ui/colors';
import {
  bodyStyles,
  headingStyles,
  type BodyLevels,
  type HeadingLevels,
  type TypographyWeights,
} from '~/ui/typography';

/**
 * Fonts are registered under their weight-specific names (see App.tsx). Native platforms look
 * fonts up by exact name, so `fontFamily: 'Figtree'` + `fontWeight` silently falls back to the
 * system font. Pick the family by weight instead.
 */
const fontFamilyByWeight: Record<TypographyWeights, string> = {
  regular: 'Figtree_400Regular',
  semibold: 'Figtree_600SemiBold',
};

type TextProps = Omit<RNTextProps, 'style'> & {
  weight?: TypographyWeights;
  /** Maps to the `text-text-*` tokens, which are safelisted in tailwind.config.js. */
  color?: TextColors;
  className?: string;
} & ({ variant: 'heading'; size?: HeadingLevels } | { variant?: 'body'; size?: BodyLevels });

export const Text = ({
  variant = 'body',
  size,
  weight,
  color = 'primary',
  className = '',
  ...props
}: TextProps) => {
  const { fontSize, lineHeight } =
    variant === 'heading'
      ? headingStyles[(size as HeadingLevels) ?? 'lg']
      : bodyStyles[(size as BodyLevels) ?? 'lg'];
  const resolvedWeight = weight ?? (variant === 'heading' ? 'semibold' : 'regular');

  return (
    <RNText
      className={`text-text-${color} ${className}`}
      style={{ fontSize, lineHeight, fontFamily: fontFamilyByWeight[resolvedWeight] }}
      {...props}
    />
  );
};
