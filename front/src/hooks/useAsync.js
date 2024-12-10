import { useState, useCallback, useEffect } from 'react';
import { handleError, formatErrorMessage } from '../utils/errorHandler';

export const useAsync = (asyncFunction, immediate = false) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    setStatus('pending');
    setError(null);
    
    try {
      const response = await asyncFunction(...params);
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
      setStatus('error');
      handleError(error); // 전역 에러 처리
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (status === 'error') {
      execute();
    }
  }, [status, execute]);

  return {
    execute,
    reset,
    retry,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle'
  };
};

export default useAsync;