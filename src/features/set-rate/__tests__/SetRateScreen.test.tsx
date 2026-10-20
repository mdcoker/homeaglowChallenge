import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { SetRateScreen } from '../SetRateScreen';

import * as api from '~/api/rates';

const applicantId = 'applicant-123';

beforeEach(() => api.resetMockApi({ latencyMs: 0 }));
afterEach(() => jest.restoreAllMocks());

async function renderScreen(state = 'TX') {
  const onBack = jest.fn();
  const onContinue = jest.fn();
  await render(
    <SetRateScreen
      applicantId={applicantId}
      applicantState={state}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
  await screen.findByRole('header', { name: 'Set your hourly rate' });
  return { onBack, onContinue };
}

const hourlyRate = () => screen.getByRole('adjustable', { name: 'Hourly rate' });
const continueButton = () => screen.getByRole('button', { name: 'Continue' });

describe('SetRateScreen', () => {
  describe('loading the config', () => {
    it('shows the header while loading, then the form', async () => {
      api.mockOptions.latencyMs = 50;
      await render(
        <SetRateScreen
          applicantId={applicantId}
          applicantState="TX"
          onBack={jest.fn()}
          onContinue={jest.fn()}
        />
      );

      expect(screen.getByText('Step 2 of 7')).toBeOnTheScreen();
      expect(screen.queryByText('Set your hourly rate')).not.toBeOnTheScreen();
      expect(await screen.findByText('Set your hourly rate')).toBeOnTheScreen();
    });

    it('shows an error with a working retry', async () => {
      const user = userEvent.setup();
      api.mockOptions.failFetch = true;
      await render(
        <SetRateScreen
          applicantId={applicantId}
          applicantState="TX"
          onBack={jest.fn()}
          onContinue={jest.fn()}
        />
      );

      expect(await screen.findByText("We couldn't load your rate details.")).toBeOnTheScreen();

      api.mockOptions.failFetch = false;
      await user.press(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText('Set your hourly rate')).toBeOnTheScreen();
      expect(screen.queryByText("We couldn't load your rate details.")).not.toBeOnTheScreen();
    });
  });

  it('calls onBack from the header', async () => {
    const user = userEvent.setup();
    const { onBack } = await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  describe('hourly rate', () => {
    it('starts at the recommended rate', async () => {
      await renderScreen();

      expect(screen.getByText('$20')).toBeOnTheScreen();
      expect(hourlyRate()).toHaveAccessibilityValue({ text: '$20 per hour' });
      expect(screen.getByText('Recommended rate: $20/hr')).toBeOnTheScreen();
      expect(screen.getByText("We estimate you'll get 4 jobs a week")).toBeOnTheScreen();
    });

    it('updates the jobs estimate as the rate changes', async () => {
      const user = userEvent.setup();
      await renderScreen();

      await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));

      expect(screen.getByText('$21')).toBeOnTheScreen();
      expect(screen.getByText("We estimate you'll get 3 jobs a week")).toBeOnTheScreen();
    });

    it('uses the singular for one job', async () => {
      await api.submitRate({ applicantId, request: { policy: 'marketing-fee', hourlyRate: 30 } });

      await renderScreen();

      expect(screen.getByText("We estimate you'll get 1 job a week")).toBeOnTheScreen();
    });

    it('starts from a previously saved rate', async () => {
      await api.submitRate({ applicantId, request: { policy: 'marketing-fee', hourlyRate: 15 } });

      await renderScreen();

      expect(hourlyRate()).toHaveAccessibilityValue({ text: '$15 per hour' });
      expect(screen.getByRole('button', { name: 'Decrease hourly rate' })).toBeDisabled();
    });

    it('toggles the recommended rate explanation', async () => {
      const user = userEvent.setup();
      await renderScreen();
      const helpButton = screen.getByRole('button', {
        name: 'How is the recommended rate calculated?',
      });
      const explanation = /Based on what cleaners in your area charge/;

      expect(helpButton).toBeCollapsed();
      expect(screen.queryByText(explanation)).not.toBeOnTheScreen();

      await user.press(helpButton);
      expect(helpButton).toBeExpanded();
      expect(screen.getByText(explanation)).toBeOnTheScreen();

      await user.press(helpButton);
      expect(screen.queryByText(explanation)).not.toBeOnTheScreen();
    });
  });

  describe('marketing-fee states', () => {
    it('shows the new-client rate after the fee, tracking the hourly rate', async () => {
      const user = userEvent.setup();
      await renderScreen('TX');

      expect(screen.getByText('$15/hr')).toBeOnTheScreen();
      expect(screen.queryByRole('switch')).not.toBeOnTheScreen();

      await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));

      expect(screen.getByText('$16/hr')).toBeOnTheScreen();
    });

    it('submits only the hourly rate', async () => {
      const user = userEvent.setup();
      const submitSpy = jest.spyOn(api, 'submitRate');
      const { onContinue } = await renderScreen('TX');

      await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));
      await user.press(continueButton());

      await waitFor(() =>
        expect(onContinue).toHaveBeenCalledWith({ hourlyRate: 21, newClientRate: null })
      );
      expect(submitSpy).toHaveBeenCalledWith({
        applicantId,
        request: { policy: 'marketing-fee', hourlyRate: 21 },
      });
    });
  });

  describe('custom-rate states', () => {
    const toggle = () => screen.getByRole('switch', { name: 'Set a custom rate for new clients' });

    it('shows the toggle instead of the fee', async () => {
      await renderScreen('CA');

      expect(screen.getByText('Set new client rate')).toBeOnTheScreen();
      expect(screen.queryByText('$15/hr')).not.toBeOnTheScreen();
      expect(toggle()).not.toBeChecked();
      expect(screen.queryByText('New clients')).not.toBeOnTheScreen();
    });

    it('submits no new-client rate when the toggle is off', async () => {
      const user = userEvent.setup();
      const { onContinue } = await renderScreen('CA');

      await user.press(continueButton());

      await waitFor(() =>
        expect(onContinue).toHaveBeenCalledWith({ hourlyRate: 20, newClientRate: null })
      );
    });

    it('seeds the new-client rate from the hourly rate and submits it', async () => {
      const user = userEvent.setup();
      const { onContinue } = await renderScreen('CA');

      await user.press(screen.getByRole('button', { name: 'Increase hourly rate' }));
      await fireEvent(toggle(), 'valueChange', true);

      const newClientRate = screen.getByRole('adjustable', { name: 'New client rate' });
      expect(newClientRate).toHaveAccessibilityValue({ text: '$21 per hour' });

      await user.press(screen.getByRole('button', { name: 'Increase new client rate' }));
      expect(newClientRate).toHaveAccessibilityValue({ text: '$22 per hour' });

      await user.press(continueButton());
      await waitFor(() =>
        expect(onContinue).toHaveBeenCalledWith({ hourlyRate: 21, newClientRate: 22 })
      );
    });

    it('hides the new-client rate when switched back off', async () => {
      await renderScreen('CA');

      await fireEvent(toggle(), 'valueChange', true);
      expect(screen.getByText('New clients')).toBeOnTheScreen();

      await fireEvent(toggle(), 'valueChange', false);
      expect(screen.queryByText('New clients')).not.toBeOnTheScreen();
    });

    it('restores a previously saved custom rate', async () => {
      await api.submitRate({
        applicantId,
        request: { policy: 'custom-rate', hourlyRate: 25, newClientRate: 30 },
      });

      await renderScreen('CA');

      expect(hourlyRate()).toHaveAccessibilityValue({ text: '$25 per hour' });
      expect(toggle()).toBeChecked();
      expect(screen.getByRole('adjustable', { name: 'New client rate' })).toHaveAccessibilityValue({
        text: '$30 per hour',
      });
    });
  });

  describe('continuing', () => {
    it('shows progress and blocks repeat presses while saving', async () => {
      const user = userEvent.setup();
      const submitSpy = jest.spyOn(api, 'submitRate');
      const { onContinue } = await renderScreen();
      api.mockOptions.latencyMs = 50;

      await user.press(continueButton());

      expect(continueButton()).toBeBusy();
      expect(continueButton()).toBeDisabled();
      await user.press(continueButton());
      expect(submitSpy).toHaveBeenCalledTimes(1);

      await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(1));
      expect(continueButton()).not.toBeBusy();
    });

    it('shows a save error, then clears it on a successful retry', async () => {
      const user = userEvent.setup();
      const { onContinue } = await renderScreen();
      api.mockOptions.failSubmit = true;

      await user.press(continueButton());

      expect(
        await screen.findByRole('alert', {
          name: "We couldn't save your rate. Please try again.",
        })
      ).toBeOnTheScreen();
      expect(continueButton()).toBeEnabled();
      expect(onContinue).not.toHaveBeenCalled();

      api.mockOptions.failSubmit = false;
      await user.press(continueButton());

      await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    });

    it('uses a generic message for unexpected save errors', async () => {
      const user = userEvent.setup();
      jest.spyOn(api, 'submitRate').mockRejectedValueOnce(new Error('socket hang up'));
      await renderScreen();

      await user.press(continueButton());

      expect(await screen.findByRole('alert', { name: 'Something went wrong.' })).toBeOnTheScreen();
    });
  });
});
