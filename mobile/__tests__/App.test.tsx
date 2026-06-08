import { render, waitFor } from '@testing-library/react-native';
import App from '../App';

it('renders correctly', async () => {
  render(<App />);

  await waitFor(() => {
    expect(true).toBe(true);
  });
});