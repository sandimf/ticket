import { useMutation } from '@tanstack/react-query';

export interface RegisterInput {
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  password: string;
}

const register = async (payload: RegisterInput) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};