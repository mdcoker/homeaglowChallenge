import { ActivityIndicator, Pressable } from 'react-native';

import { Text } from './Text';

import { semantic } from '~/ui/colors';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
};

const variantClasses = {
  primary: 'bg-button-fill-primary active:bg-button-fill-primary-hover',
  secondary: 'bg-button-fill-secondary-filled active:bg-button-fill-secondary-filled-hover',
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`h-48 items-center justify-center rounded-round px-24 ${
        disabled ? 'bg-button-fill-secondary-disabled' : variantClasses[variant]
      }`}>
      {loading ? (
        <ActivityIndicator color={semantic.icon.primary} />
      ) : (
        <Text weight="semibold" color={disabled ? 'disabled' : 'primary'}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};
