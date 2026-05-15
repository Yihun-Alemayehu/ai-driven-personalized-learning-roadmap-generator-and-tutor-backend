import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import SystemStatsPage from './SystemStatsPage';

describe('SystemStatsPage', () => {
  it('renders 4 stat cards with correct labels', async () => {
    renderWithProviders(<SystemStatsPage />);
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getAllByText('Enrollments').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Quiz Attempts')).toBeInTheDocument();
      expect(screen.getByText('Avg Quiz Score')).toBeInTheDocument();
    });
  });

  it('displays stat values from API', async () => {
    renderWithProviders(<SystemStatsPage />);
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // users
      expect(screen.getByText('80')).toBeInTheDocument();  // enrollments
      expect(screen.getByText('Quiz Attempts')).toBeInTheDocument();
      expect(screen.getAllByText('40').length).toBeGreaterThanOrEqual(1); // quizAttempts
    });
  });

  it('shows domain stats table', async () => {
    renderWithProviders(<SystemStatsPage />);
    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
  });
});
