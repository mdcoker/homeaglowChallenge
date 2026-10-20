import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { CustomRateCard, MarketingFeeCard } from '../NewClientRateCard';

describe('MarketingFeeCard', () => {
  it('shows the rate new clients pay after the fee', async () => {
    await render(<MarketingFeeCard hourlyRate={20} feePerHour={5} />);

    expect(screen.getByText('$15/hr')).toBeOnTheScreen();
    expect(
      screen.getByText('A $5/hr marketing fee will apply to your rate for new clients.')
    ).toBeOnTheScreen();
  });
});

describe('CustomRateCard', () => {
  const baseProps = {
    rate: 20,
    onRateChange: jest.fn(),
    onEnabledChange: jest.fn(),
    min: 15,
    max: 40,
    step: 1,
  };

  it('hides the new-client stepper when disabled', async () => {
    await render(<CustomRateCard {...baseProps} enabled={false} />);

    expect(screen.getByText('Set new client rate')).toBeOnTheScreen();
    expect(screen.queryByText('New clients')).not.toBeOnTheScreen();
  });

  it('reports toggle changes', async () => {
    const onEnabledChange = jest.fn();
    await render(
      <CustomRateCard {...baseProps} enabled={false} onEnabledChange={onEnabledChange} />
    );

    await fireEvent(
      screen.getByRole('switch', { name: 'Set a custom rate for new clients' }),
      'valueChange',
      true
    );

    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  it('shows an adjustable new-client rate when enabled', async () => {
    const user = userEvent.setup();
    const onRateChange = jest.fn();
    await render(<CustomRateCard {...baseProps} enabled onRateChange={onRateChange} />);

    expect(screen.getByText('$20/hr')).toBeOnTheScreen();
    expect(screen.getByRole('adjustable', { name: 'New client rate' })).toHaveAccessibilityValue({
      text: '$20 per hour',
    });

    await user.press(screen.getByRole('button', { name: 'Increase new client rate' }));
    expect(onRateChange).toHaveBeenCalledWith(21);
  });
});
