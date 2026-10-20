import { fireEvent, render, screen } from '@testing-library/react-native';

import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('reports the new value when switched', async () => {
    const onValueChange = jest.fn();
    await render(
      <Toggle value={false} onValueChange={onValueChange} accessibilityLabel="Custom rate" />
    );

    await fireEvent(screen.getByRole('switch', { name: 'Custom rate' }), 'valueChange', true);

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('reflects its value', async () => {
    await render(<Toggle value onValueChange={jest.fn()} accessibilityLabel="Custom rate" />);

    expect(screen.getByRole('switch', { name: 'Custom rate' })).toBeChecked();
  });
});
