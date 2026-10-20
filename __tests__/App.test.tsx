import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import App from '../App';

import { resetMockApi } from '~/api/rates';

jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

const mockUseFonts = jest.mocked(useFonts);

beforeEach(() => {
  resetMockApi({ latencyMs: 0 });
  jest.mocked(SplashScreen.hideAsync).mockClear();
});
afterEach(() => jest.restoreAllMocks());

describe('App', () => {
  it('keeps the splash screen up until fonts load', async () => {
    mockUseFonts.mockReturnValue([false, null]);

    await render(<App />);

    expect(screen.toJSON()).toBeNull();
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('renders the rate screen and hides the splash once fonts load', async () => {
    mockUseFonts.mockReturnValue([true, null]);

    await render(<App />);

    expect(await screen.findByText('Set your hourly rate')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it('still renders if fonts fail to load', async () => {
    mockUseFonts.mockReturnValue([false, new Error('font failed')]);

    await render(<App />);

    expect(await screen.findByText('Set your hourly rate')).toBeOnTheScreen();
  });

  it('logs navigation it does not implement', async () => {
    const user = userEvent.setup();
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockUseFonts.mockReturnValue([true, null]);
    await render(<App />);
    await screen.findByText('Set your hourly rate');

    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(log).toHaveBeenCalledWith('Back to step 1');

    await user.press(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() =>
      expect(log).toHaveBeenCalledWith('Rate saved, go to step 3', {
        hourlyRate: 20,
        newClientRate: null,
      })
    );
  });
});
