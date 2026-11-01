import { setUpTests } from 'react-native-reanimated';

setUpTests();

// Official mock: provides fixed insets so screens render without a native provider.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories must use require
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
