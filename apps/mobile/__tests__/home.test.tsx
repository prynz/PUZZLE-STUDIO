import { BottomNavigation } from '@puzzle-studio/ui';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { HomeScreen } from '@/features/home/HomeScreen';
import { AppProviders } from '@/testing/AppProviders';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }) }));

describe('Home', () => {
  beforeEach(() => mockPush.mockClear());

  it('greets the child and leads to the creator and the parents area', async () => {
    await render(
      <AppProviders>
        <HomeScreen />
      </AppProviders>,
    );
    expect(screen.getByText('Was puzzeln wir heute?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('home-create'));
    await fireEvent.press(screen.getByTestId('home-samples'));
    await fireEvent.press(screen.getByTestId('home-awards'));
    await fireEvent.press(screen.getByLabelText('Elternbereich'));
    expect(mockPush.mock.calls).toEqual([['/create'], ['/creator/samples'], ['/awards'], ['/parents']]);
    expect(screen.getByText('Puzzle ein Bild fertig – dann gibt es Sterne!')).toBeTruthy();
  });

  it('tells Pino’s journey: chapter, next goal and the stations', async () => {
    await render(
      <AppProviders>
        <HomeScreen />
      </AppProviders>,
    );
    expect(screen.getByText('Kapitel 1 von 10')).toBeTruthy();
    expect(screen.getByText('Nächstes Ziel: Puzzle ein Bild fertig.')).toBeTruthy();
    expect(screen.getByLabelText('Pino – Begeistert')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Erstes Puzzle – nächstes Ziel'));
    expect(screen.getByLabelText('Zehn Puzzles – kommt noch')).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith('/awards');
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
