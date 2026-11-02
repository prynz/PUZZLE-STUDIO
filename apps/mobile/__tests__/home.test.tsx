import { BottomNavigation } from '@puzzle-studio/ui';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { HomeScreen } from '@/features/home/HomeScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }) }));

describe('Home', () => {
  beforeEach(() => mockPush.mockClear());

  it('greets the child and leads to the creator and the parents area', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Was puzzeln wir heute?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('home-create'));
    await fireEvent.press(screen.getByLabelText('Elternbereich'));
    expect(mockPush.mock.calls).toEqual([['/create'], ['/parents']]);
  });

  it('shows Pino with an accessible label', async () => {
    await render(<HomeScreen />);
    expect(screen.getByLabelText('Pino – Fröhlich')).toBeTruthy();
  });
});

describe('BottomNavigation', () => {
  it('marks the active tab and reports selections', async () => {
    const onSelect = jest.fn();
    await render(
      <BottomNavigation
        activeKey="home"
        onSelect={onSelect}
        items={[
          { key: 'home', label: 'Start', icon: 'home' },
          { key: 'awards', label: 'Erfolge', icon: 'awards' },
        ]}
      />,
    );
    expect(screen.getByTestId('tab-home').props.accessibilityState).toMatchObject({ selected: true });
    await fireEvent.press(screen.getByTestId('tab-awards'));
    expect(onSelect).toHaveBeenCalledWith('awards');
  });
});
