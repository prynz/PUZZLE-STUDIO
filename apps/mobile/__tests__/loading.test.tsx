import { LoadingScreen } from '@puzzle-studio/ui';
import { render, screen } from '@testing-library/react-native';

import { t } from '@/i18n';

describe('loading screen', () => {
  it('tells what is happening, is announced as busy and shows no made-up percentage', async () => {
    await render(<LoadingScreen testID="loading" title={t('loading.title')} message={t('play.loading')} />);
    expect(screen.getByText('Wird geladen …')).toBeTruthy();
    expect(screen.getByText(t('play.loading'))).toBeTruthy();
    expect(screen.getByTestId('loading').props.accessibilityState).toEqual({ busy: true });
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
