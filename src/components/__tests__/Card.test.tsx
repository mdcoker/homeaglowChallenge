import { render, screen } from '@testing-library/react-native';

import { Card, CardDivider } from '../Card';
import { Text } from '../Text';

describe('Card', () => {
  it.each(['outlined', 'filled'] as const)('renders its children (%s)', async (variant) => {
    await render(
      <Card variant={variant}>
        <Text>Inside</Text>
        <CardDivider />
      </Card>
    );

    expect(screen.getByText('Inside')).toBeOnTheScreen();
  });

  it('defaults to outlined and forwards view props', async () => {
    await render(<Card testID="card" />);

    expect(screen.getByTestId('card')).toBeOnTheScreen();
  });
});
