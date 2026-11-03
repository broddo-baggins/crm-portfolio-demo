
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
};

export default Index;
