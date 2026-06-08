// __tests__/App.test.tsx
import { render } from '@testing-library/react-native';
import App from '../App';

it('renders correctly', async () => {
  const { findByTestId } = render(<App />);
  
  // await findByTestId('root-view');
});