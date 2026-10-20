import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { semantic } from '~/ui/colors';

type IconButtonProps = {
  icon: ComponentProps<typeof Feather>['name'];
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  /** `outlined` is the circular stepper style; `ghost` is a bare icon (e.g. the back arrow). */
  variant?: 'outlined' | 'ghost';
  size?: 'sm' | 'md';
};

const sizes = {
  sm: { box: 'h-28 w-28', icon: 16 },
  md: { box: 'h-32 w-32', icon: 20 },
};

export const IconButton = ({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  variant = 'outlined',
  size = 'md',
}: IconButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    hitSlop={8}
    className={`items-center justify-center rounded-round ${sizes[size].box} ${
      variant === 'outlined'
        ? 'border-thin border-border-primary active:bg-button-fill-secondary-outlined-hover'
        : ''
    }`}>
    <Feather
      name={icon}
      size={variant === 'ghost' ? 24 : sizes[size].icon}
      color={disabled ? semantic.icon.disabled : semantic.icon.primary}
    />
  </Pressable>
);
