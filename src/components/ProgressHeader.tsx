import { View } from 'react-native';

import { IconButton } from './IconButton';
import { Text } from './Text';

type ProgressHeaderProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
};

export const ProgressHeader = ({ step, totalSteps, onBack }: ProgressHeaderProps) => {
  const progress = `${(step / totalSteps) * 100}%` as const;

  return (
    <View>
      <View className="h-48 flex-row items-center justify-center px-16">
        <View className="absolute left-16">
          <IconButton
            icon="arrow-left"
            variant="ghost"
            accessibilityLabel="Back"
            onPress={onBack}
          />
        </View>
        <Text weight="semibold" accessibilityRole="header">
          Step {step} of {totalSteps}
        </Text>
      </View>

      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Onboarding progress"
        accessibilityValue={{ min: 0, max: totalSteps, now: step }}
        className="h-[1px] bg-border-primary">
        <View
          className="absolute left-0 top-[-1px] h-[2px] bg-fill-brand-emphasis"
          style={{ width: progress }}
        />
        <View
          className="absolute top-[-3px] ml-[-3px] h-6 w-6 rounded-round bg-fill-brand-emphasis"
          style={{ left: progress }}
        />
      </View>
    </View>
  );
};
