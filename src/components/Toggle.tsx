import { Switch } from 'react-native';

import { primitive } from '~/ui/colors';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

export const Toggle = ({ value, onValueChange, accessibilityLabel, disabled }: ToggleProps) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    accessibilityLabel={accessibilityLabel}
    disabled={disabled}
    trackColor={{ false: primitive.neutral['200'], true: primitive.neutral['1100'] }}
    ios_backgroundColor={primitive.neutral['200']}
    thumbColor={primitive.neutral['000']}
  />
);
