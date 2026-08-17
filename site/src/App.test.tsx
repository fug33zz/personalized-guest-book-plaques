import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('editor', () => {
  beforeEach(() => localStorage.clear());

  it('updates the live preview and persists a valid design', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Names'), { target: { value: 'Lina & Marc' } });
    expect(screen.getByText('Lina & Marc', { selector: 'text' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('guest-book-plaque-design-v1') ?? '{}').names).toBe('Lina & Marc');
  });

  it('blocks an empty required field', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Event date'), { target: { value: '' } });
    expect(screen.getByText('Enter the event date.')).toBeInTheDocument();
    expect(screen.getByText('Needs attention')).toBeInTheDocument();
  });

  it('switches between approved lettering styles', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Modern clean' }));
    expect(screen.getByRole('button', { name: 'Modern clean' })).toHaveClass('selected');
  });
});

