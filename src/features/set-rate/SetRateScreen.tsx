import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomRateCard, MarketingFeeCard } from './NewClientRateCard';
import { clampRate, estimateJobsPerWeek, formatRate } from './rateMath';
import { useRateConfig } from './useRateConfig';

import {
  ApiError,
  submitRate,
  type RateConfig,
  type SavedRate,
  type SubmitRateRequest,
} from '~/api/rates';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { ProgressHeader } from '~/components/ProgressHeader';
import { Stepper } from '~/components/Stepper';
import { Text } from '~/components/Text';
import { semantic } from '~/ui/colors';

type SetRateScreenProps = {
  applicantId: string;
  applicantState: string;
  onBack: () => void;
  /** Called once the rate is saved; the parent moves on to step 3. */
  onContinue: (saved: SavedRate) => void;
};

export const SetRateScreen = ({
  applicantId,
  applicantState,
  onBack,
  onContinue,
}: SetRateScreenProps) => {
  const rateConfig = useRateConfig(applicantId, applicantState);

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      <ProgressHeader step={2} totalSteps={7} onBack={onBack} />

      {rateConfig.status === 'loading' && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={semantic.icon.secondary} />
        </View>
      )}

      {rateConfig.status === 'error' && (
        <View className="flex-1 items-center justify-center gap-16 px-24">
          <Text className="text-center">{rateConfig.message}</Text>
          <Button variant="secondary" label="Try again" onPress={rateConfig.retry} />
        </View>
      )}

      {rateConfig.status === 'success' && (
        <SetRateForm config={rateConfig.config} applicantId={applicantId} onSaved={onContinue} />
      )}
    </SafeAreaView>
  );
};

/** Split out so form state can be initialised from the loaded config. */
const SetRateForm = ({
  config,
  applicantId,
  onSaved,
}: {
  config: RateConfig;
  applicantId: string;
  onSaved: (saved: SavedRate) => void;
}) => {
  const { minRate, maxRate, step, newClientPolicy } = config;

  const [hourlyRate, setHourlyRate] = useState(() =>
    clampRate(config.current?.hourlyRate ?? config.recommendedRate, config)
  );
  const [customNewClientRateEnabled, setCustomNewClientRateEnabled] = useState(
    config.current?.newClientRate != null
  );
  const [newClientRate, setNewClientRate] = useState(
    () => config.current?.newClientRate ?? hourlyRate
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const jobsPerWeek = estimateJobsPerWeek(hourlyRate, config.jobEstimates);

  const handleCustomRateToggle = (enabled: boolean) => {
    // Start from the main rate each time it's switched on, as in the design.
    if (enabled) setNewClientRate(hourlyRate);
    setCustomNewClientRateEnabled(enabled);
  };

  const handleContinue = async () => {
    // Only send what the policy allows; the fee is applied server-side, never by the client.
    const request: SubmitRateRequest =
      newClientPolicy.type === 'custom-rate'
        ? {
            policy: 'custom-rate',
            hourlyRate,
            newClientRate: customNewClientRateEnabled ? newClientRate : null,
          }
        : { policy: 'marketing-fee', hourlyRate };

    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await submitRate({ applicantId, request });
      onSaved(saved);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerClassName="px-24 pb-24 pt-32">
        <View className="gap-8">
          <Text variant="heading" size="lg" accessibilityRole="header">
            Set your hourly rate
          </Text>
          <Text>
            Choose how much you want to earn on your cleanings. You can change this anytime.
          </Text>
        </View>

        <View className="items-center gap-8 py-64">
          <Stepper
            label="Hourly rate"
            value={hourlyRate}
            onChange={setHourlyRate}
            min={minRate}
            max={maxRate}
            step={step}
            formatValue={formatRate}
            accessibilityValueText={(value) => `${formatRate(value)} per hour`}
          />
          <RecommendedRate rate={config.recommendedRate} />
        </View>

        <View className="gap-12">
          <Card variant="filled" className="flex-row items-center gap-12 px-16 py-12">
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={24}
              color={semantic.icon.primary}
            />
            <Text className="flex-1" accessibilityLiveRegion="polite">
              We estimate you&apos;ll get{' '}
              <Text weight="semibold">
                {jobsPerWeek} {jobsPerWeek === 1 ? 'job' : 'jobs'}
              </Text>{' '}
              a week
            </Text>
          </Card>

          {newClientPolicy.type === 'marketing-fee' ? (
            <MarketingFeeCard hourlyRate={hourlyRate} feePerHour={newClientPolicy.feePerHour} />
          ) : (
            <CustomRateCard
              enabled={customNewClientRateEnabled}
              onEnabledChange={handleCustomRateToggle}
              rate={newClientRate}
              onRateChange={setNewClientRate}
              min={minRate}
              max={maxRate}
              step={step}
            />
          )}
        </View>
      </ScrollView>

      <View className="gap-12 px-24 pb-16 pt-8">
        {submitError && (
          <Text size="md" color="critical" className="text-center" accessibilityRole="alert">
            {submitError}
          </Text>
        )}
        <Button label="Continue" onPress={handleContinue} loading={submitting} />
      </View>
    </>
  );
};

const RecommendedRate = ({ rate }: { rate: number }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <View className="items-center gap-8">
      <View className="flex-row items-center gap-4">
        <Text size="md" color="secondary">
          Recommended rate:{' '}
          <Text size="md" weight="semibold" color="secondary">
            {formatRate(rate)}/hr
          </Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="How is the recommended rate calculated?"
          accessibilityState={{ expanded: showHelp }}
          hitSlop={8}
          onPress={() => setShowHelp((shown) => !shown)}>
          <Feather name="help-circle" size={16} color={semantic.icon.tertiary} />
        </Pressable>
      </View>
      {showHelp && (
        <Text size="sm" color="secondary" className="max-w-[280px] text-center">
          Based on what cleaners in your area charge and how often clients book at that rate.
        </Text>
      )}
    </View>
  );
};
