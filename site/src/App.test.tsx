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
    fireEvent.click(screen.getByRole('button', { name: 'Montserrat' }));
    expect(screen.getByRole('button', { name: 'Montserrat' })).toHaveClass('selected');
  });

  it('offers direct Bambu project generation', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Generate Bambu 3MF' })).toBeEnabled();
  });

  it('switches templates and exposes only eligible parts', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button',{name:/Modern offset/i}));
    expect(screen.getByText('Clean & architectural')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Montserrat'})).toHaveClass('selected');
    expect(screen.queryByRole('button',{name:'Lobster script'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Leaf sprigs'})).not.toBeInTheDocument();
  });
});

