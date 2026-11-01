import { fireEvent, render, screen } from '@testing-library/react-native';

import { StartScreen } from '@/features/foundation/StartScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

describe('StartScreen', () => {
  beforeEach(() => mockPush.mockClear());

  it('shows the greeting and both entry points', async () => {
    await render(<StartScreen />);
    expect(screen.getByText('Hallo, ich bin Pino!')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Systemcheck' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '256-Teile-Test' })).toBeTruthy();
  });

  it('navigates to the system check and the benchmark', async () => {
    await render(<StartScreen />);
    fireEvent.press(screen.getByTestId('start-system-check'));
    fireEvent.press(screen.getByTestId('start-benchmark'));
    expect(mockPush.mock.calls).toEqual([['/system-check'], ['/dev/stress']]);
  });
});
