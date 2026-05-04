import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/settings/organization', { replace: true }); }, []);
  return null;
}