import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { Stepper } from '../Stepper';

type StepperProps = ComponentProps<typeof Stepper>;

async function renderStepper(props: Partial<StepperProps> = {}) {
  const onChange = jest.fn();
  await render(
    <Stepper
      label="Hourly rate"
      value={20}
      onChange={onChange}
      min={15}
      max={40}
      step={1}
      formatValue={(value) => `$${value}`}
      {...props}
    />
  );
  return onChange;
}

describe('Stepper', () => {
  it('shows the formatted value', async () => {
    await renderStepper();

    expect(screen.getByText('$20')).toBeOnTheScreen();
  });

  it('increments and decrements by the step', async () => {
    const user = userEvent.setup();
    const onChange = await renderStepper({ step: 5 });

    await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));
    expect(onChange).toHaveBeenLastCalledWith(25);

    await user.press(screen.getByRole('button', { name: 'Decrease hourly rate' }));
    expect(onChange).toHaveBeenLastCalledWith(15);
  });

  it('clamps a step that would overshoot the bounds', async () => {
    const user = userEvent.setup();
    const onChange = await renderStepper({ value: 38, step: 5 });

    await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));
    expect(onChange).toHaveBeenLastCalledWith(40);
  });

  it('clamps a step that would undershoot the bounds', async () => {
    const user = userEvent.setup();
    const onChange = await renderStepper({ value: 17, step: 5 });

    await user.press(screen.getByRole('button', { name: 'Decrease hourly rate' }));
    expect(onChange).toHaveBeenLastCalledWith(15);
  });

  it('disables decrease at the minimum', async () => {
    await renderStepper({ value: 15 });

    expect(screen.getByRole('button', { name: 'Decrease hourly rate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase hourly rate' })).toBeEnabled();
  });

  it('disables increase at the maximum', async () => {
    await renderStepper({ value: 40 });

    expect(screen.getByRole('button', { name: 'Increase hourly rate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease hourly rate' })).toBeEnabled();
  });

  describe('screen reader support', () => {
    it('exposes the value, using the visible text by default', async () => {
      await renderStepper();

      expect(screen.getByRole('adjustable', { name: 'Hourly rate' })).toHaveAccessibilityValue({
        text: '$20',
      });
    });

    it('uses custom spoken text when provided', async () => {
      await renderStepper({ accessibilityValueText: (value) => `$${value} per hour` });

      expect(screen.getByRole('adjustable', { name: 'Hourly rate' })).toHaveAccessibilityValue({
        text: '$20 per hour',
      });
    });

    it.each([
      ['increment', 21],
      ['decrement', 19],
    ])('handles the %s action', async (actionName, expected) => {
      const onChange = await renderStepper();

      await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', {
        nativeEvent: { actionName },
      });

      expect(onChange).toHaveBeenCalledWith(expected);
    });
  });

  it('renders the small size', async () => {
    const user = userEvent.setup();
    const onChange = await renderStepper({
      size: 'sm',
      formatValue: (value) => `$${value}/hr`,
    });

    expect(screen.getByText('$20/hr')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));
    expect(onChange).toHaveBeenCalledWith(21);
  });
});
