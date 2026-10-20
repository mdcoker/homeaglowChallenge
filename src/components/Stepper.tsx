import { View } from 'react-native';

import { IconButton } from './IconButton';
import { Text } from './Text';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  /** Visible value, e.g. "$20" or "$20/hr". */
  formatValue: (value: number) => string;
  /** What the value is, for screen readers, e.g. "Hourly rate". */
  label: string;
  /** Spoken value, e.g. "$20 per hour". Defaults to the visible text. */
  accessibilityValueText?: (value: number) => string;
  size?: 'sm' | 'lg';
};

export const Stepper = ({
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  label,
  accessibilityValueText = formatValue,
  size = 'lg',
}: StepperProps) => {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const isLarge = size === 'lg';

  return (
    <View
      // "adjustable" lets VoiceOver/TalkBack users swipe up/down to change the value.
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: accessibilityValueText(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) =>
        nativeEvent.actionName === 'increment' ? increment() : decrement()
      }
      className={`flex-row items-center ${isLarge ? 'gap-16' : 'gap-8'}`}>
      <IconButton
        icon="minus"
        size={isLarge ? 'md' : 'sm'}
        accessibilityLabel={`Decrease ${label.toLowerCase()}`}
        disabled={value <= min}
        onPress={decrement}
      />
      <Text
        variant={isLarge ? 'heading' : 'body'}
        size={isLarge ? '4xl' : 'lg'}
        className={`text-center ${isLarge ? 'min-w-[150px]' : 'min-w-[64px]'}`}>
        {formatValue(value)}
      </Text>
      <IconButton
        icon="plus"
        size={isLarge ? 'md' : 'sm'}
        accessibilityLabel={`Increase ${label.toLowerCase()}`}
        disabled={value >= max}
        onPress={increment}
      />
    </View>
  );
};
