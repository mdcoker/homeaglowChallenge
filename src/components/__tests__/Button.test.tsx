import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Continue" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports the secondary variant', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button variant="secondary" label="Try again" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Try again' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and blocks presses while loading', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Continue" onPress={onPress} loading />);

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    expect(screen.queryByText('Continue')).not.toBeOnTheScreen();

    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('blocks presses when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Continue" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toBeDisabled();
    expect(button).not.toBeBusy();

    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
