import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HealthInfoForm from './HealthInfoForm';

describe('HealthInfoForm', () => {
  const mockSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders form fields correctly', () => {
    render(<HealthInfoForm onSubmit={mockSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/신장/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/체중/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/혈압/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/혈당/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
  });

  test('handles form submission with valid data', async () => {
    render(<HealthInfoForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/신장/i), '170');
    await userEvent.type(screen.getByLabelText(/체중/i), '70');
    await userEvent.type(screen.getByLabelText(/혈압/i), '120/80');
    await userEvent.type(screen.getByLabelText(/혈당/i), '95');

    await userEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        height: 170,
        weight: 70,
        bloodPressure: '120/80',
        bloodSugar: 95
      });
    });
  });

  test('validates input fields', async () => {
    render(<HealthInfoForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/신장/i), '-170');
    await userEvent.type(screen.getByLabelText(/체중/i), '0');
    await userEvent.type(screen.getByLabelText(/혈압/i), 'invalid');
    await userEvent.type(screen.getByLabelText(/혈당/i), 'abc');

    await userEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByText(/올바른 신장을 입력해주세요/i)).toBeInTheDocument();
      expect(screen.getByText(/올바른 체중을 입력해주세요/i)).toBeInTheDocument();
      expect(screen.getByText(/올바른 혈압 형식이 아닙니다/i)).toBeInTheDocument();
      expect(screen.getByText(/올바른 혈당 값을 입력해주세요/i)).toBeInTheDocument();
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  test('handles cancel button click', async () => {
    render(<HealthInfoForm onSubmit={mockSubmit} onCancel={mockOnCancel} />);
    
    await userEvent.click(screen.getByRole('button', { name: /취소/i }));
    
    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('clears form after successful submission', async () => {
    render(<HealthInfoForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/신장/i), '170');
    await userEvent.type(screen.getByLabelText(/체중/i), '70');
    await userEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/신장/i)).toHaveValue('');
      expect(screen.getByLabelText(/체중/i)).toHaveValue('');
    });
  });

  test('handles API error during submission', async () => {
    const mockErrorSubmit = jest.fn().mockRejectedValue(new Error('API Error'));
    render(<HealthInfoForm onSubmit={mockErrorSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/신장/i), '170');
    await userEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByText(/저장 중 오류가 발생했습니다/i)).toBeInTheDocument();
    });
  });
});