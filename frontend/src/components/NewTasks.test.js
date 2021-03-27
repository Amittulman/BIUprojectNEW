import { render, screen } from '@testing-library/react';
import NewTasks from './NewTasks';

test('renders learn react link', () => {
  render(<NewTasks />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
