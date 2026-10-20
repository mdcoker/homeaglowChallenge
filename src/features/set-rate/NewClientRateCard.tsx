import { View } from 'react-native';

import { formatRate, rateAfterFee } from './rateMath';

import { Card, CardDivider } from '~/components/Card';
import { Stepper } from '~/components/Stepper';
import { Text } from '~/components/Text';
import { Toggle } from '~/components/Toggle';

/** Default experience: a fixed marketing fee comes off the rate for new clients. */
export const MarketingFeeCard = ({
  hourlyRate,
  feePerHour,
}: {
  hourlyRate: number;
  feePerHour: number;
}) => (
  <Card className="flex-row gap-16 p-16">
    <View className="flex-1 gap-4">
      <Text weight="semibold">New client rate</Text>
      <Text size="md">
        A {formatRate(feePerHour)}/hr marketing fee will apply to your rate for new clients.
      </Text>
    </View>
    <Text weight="semibold">{formatRate(rateAfterFee(hourlyRate, feePerHour))}/hr</Text>
  </Card>
);

/** State-specific experience: the applicant may opt into a separate new-client rate. */
export const CustomRateCard = ({
  enabled,
  onEnabledChange,
  rate,
  onRateChange,
  min,
  max,
  step,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  min: number;
  max: number;
  step: number;
}) => (
  <Card>
    <View className="flex-row items-center gap-16 p-16">
      <View className="flex-1 gap-4">
        <Text weight="semibold">Set new client rate</Text>
        <Text size="md">Choose a custom hourly rate for new clients.</Text>
      </View>
      <Toggle
        value={enabled}
        onValueChange={onEnabledChange}
        accessibilityLabel="Set a custom rate for new clients"
      />
    </View>

    {enabled && (
      <>
        <CardDivider />
        <View className="flex-row items-center justify-between p-16">
          <Text weight="semibold">New clients</Text>
          <Stepper
            size="sm"
            label="New client rate"
            value={rate}
            onChange={onRateChange}
            min={min}
            max={max}
            step={step}
            formatValue={(value) => `${formatRate(value)}/hr`}
            accessibilityValueText={(value) => `${formatRate(value)} per hour`}
          />
        </View>
      </>
    )}
  </Card>
);
