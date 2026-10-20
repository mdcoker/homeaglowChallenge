import { render, screen } from '@testing-library/react-native';

import { Text } from '../Text';

describe('Text', () => {
  it('defaults to large regular body text', async () => {
    await render(<Text>Body</Text>);

    expect(screen.getByText('Body')).toHaveStyle({
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Figtree_400Regular',
    });
  });

  it('uses the requested body size and weight', async () => {
    await render(
      <Text size="sm" weight="semibold" color="secondary">
        Small
      </Text>
    );

    expect(screen.getByText('Small')).toHaveStyle({
      fontSize: 13,
      fontFamily: 'Figtree_600SemiBold',
    });
  });

  it('defaults headings to large semibold', async () => {
    await render(<Text variant="heading">Heading</Text>);

    expect(screen.getByText('Heading')).toHaveStyle({
      fontSize: 24,
      lineHeight: 32,
      fontFamily: 'Figtree_600SemiBold',
    });
  });

  it('lets headings use another size and weight', async () => {
    await render(
      <Text variant="heading" size="4xl" weight="regular">
        Big
      </Text>
    );

    expect(screen.getByText('Big')).toHaveStyle({
      fontSize: 64,
      fontFamily: 'Figtree_400Regular',
    });
  });
});
