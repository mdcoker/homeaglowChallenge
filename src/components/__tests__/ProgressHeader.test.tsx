import { render, screen, userEvent } from '@testing-library/react-native';

import { ProgressHeader } from '../ProgressHeader';

describe('ProgressHeader', () => {
  it('shows the current step', async () => {
    await render(<ProgressHeader step={2} totalSteps={7} onBack={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'Step 2 of 7' })).toBeOnTheScreen();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 7, now: 2 });
  });

  it('calls onBack when the back button is pressed', async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    await render(<ProgressHeader step={2} totalSteps={7} onBack={onBack} />);

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
