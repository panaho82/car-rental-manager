import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { DocumentsList } from '../../components/Documents/DocumentsList';
import { DocumentGenerator } from '../../components/Documents/DocumentGenerator';
import { useNavigate, useLocation } from 'react-router-dom';

export const DocumentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.includes('new') ? 1 : 0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    navigate(newValue === 0 ? '/documents' : '/documents/new');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Liste des documents" />
          <Tab label="Nouveau document" />
        </Tabs>
      </Box>
      {activeTab === 0 && <DocumentsList />}
      {activeTab === 1 && <DocumentGenerator />}
    </Box>
  );
};
