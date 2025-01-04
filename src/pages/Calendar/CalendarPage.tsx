import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
} from '@mui/material';
import { DetailedCalendar } from '../../components/Calendar/DetailedCalendar';
import { CustomCalendar } from '../../components/Calendar/CustomCalendar';
import { ReservationForm } from '../../components/Reservations/ReservationForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calendar-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const CalendarPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="calendar tabs"
          sx={{ bgcolor: 'transparent' }}
        >
          <Tab label="Calendrier détaillé" />
          <Tab label="Liste des réservations" />
          <Tab label="Vue mensuelle" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <DetailedCalendar />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CustomCalendar />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Future implementation of monthly view */}
        <Box sx={{ p: 3 }}>Vue mensuelle (à venir)</Box>
      </TabPanel>
    </Box>
  );
};
