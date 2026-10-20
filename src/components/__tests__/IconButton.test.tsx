import { render, screen, userEvent } from '@testing-library/react-native';

import { IconButton } from '../IconButton';

describe('IconButton', () => {
  it.each([
    ['outlined', 'md'],
    ['outlined', 'sm'],
    ['ghost', 'md'],
  ] as const)('calls onPress for the %s %s variant', async (variant, size) => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(
      <IconButton
        icon="plus"
        accessibilityLabel="Add"
        variant={variant}
        size={size}
        onPress={onPress}
      />
    );

    await user.press(screen.getByRole('button', { name: 'Add' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks presses when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<IconButton icon="plus" accessibilityLabel="Add" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toBeDisabled();

    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
