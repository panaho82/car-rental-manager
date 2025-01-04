import React, { useEffect, useState } from 'react';
import { Box, Typography, ButtonGroup, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarToday,
  CalendarViewWeek,
  CalendarViewMonth
} from '@mui/icons-material';
import WeekTimeline from '../../components/Calendar/WeekTimeline';
import { supabase } from '../../lib/supabase';
import { addDays, addMonths, startOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Resource {
  id: string;
  name: string;
  type: 'vehicle' | 'bungalow';
  image_url?: string;
  license_plate?: string;
}

type ViewType = 'week' | 'month';

const CalendarPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    
    try {
      // Récupérer les véhicules
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, brand, model, license_plate, image_url, status')
        .eq('status', 'available');

      if (vehiclesError) {
        console.error('Error fetching vehicles:', vehiclesError);
        return;
      }

      // Récupérer les bungalows
      const { data: bungalows, error: bungalowsError } = await supabase
        .from('bungalows')
        .select('id, name, image_url, status')
        .eq('status', 'available');

      if (bungalowsError) {
        console.error('Error fetching bungalows:', bungalowsError);
        return;
      }

      // Transformer les véhicules en ressources
      const vehicleResources: Resource[] = vehicles.map(vehicle => ({
        id: vehicle.id,
        name: `${vehicle.brand} ${vehicle.model}`,
        type: 'vehicle',
        image_url: vehicle.image_url,
        license_plate: vehicle.license_plate
      }));

      // Transformer les bungalows en ressources
      const bungalowResources: Resource[] = bungalows.map(bungalow => ({
        id: bungalow.id,
        name: bungalow.name,
        type: 'bungalow',
        image_url: bungalow.image_url
      }));

      // Combiner et définir toutes les ressources
      setResources([...vehicleResources, ...bungalowResources]);
      console.log('Resources set:', [...vehicleResources, ...bungalowResources]); // Debug log
    } catch (error) {
      console.error('Error in fetchResources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const handleNext = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRange = () => {
    const start = startOfWeek(currentDate, { locale: fr });
    const end = addDays(start, 6);
    return { start, end };
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: ViewType) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  const currentDateDisplay = format(currentDate, 'MMMM yyyy', { locale: fr });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: '1px solid #e0e0e0',
        bgcolor: 'white',
        pl: 4
      }}>
        <ButtonGroup variant="outlined" size="small" sx={{ '& .MuiButton-root': { color: 'text.primary' } }}>
          <Button onClick={handlePrevious}>
            <ChevronLeft />
          </Button>
          <Button onClick={handleToday}>
            <CalendarToday sx={{ mr: 1 }} />
            Aujourd'hui
          </Button>
          <Button onClick={handleNext}>
            <ChevronRight />
          </Button>
        </ButtonGroup>

        <Typography variant="h6" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
          {currentDateDisplay}
        </Typography>

        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ '& .MuiToggleButton-root': { color: 'text.primary' } }}
        >
          <ToggleButton value="week">
            <CalendarViewWeek sx={{ mr: 1 }} />
            Semaine
          </ToggleButton>
          <ToggleButton value="month">
            <CalendarViewMonth sx={{ mr: 1 }} />
            Mois
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewType === 'week' && (
        <WeekTimeline
          resources={resources}
          startDate={getDateRange().start}
          endDate={getDateRange().end}
        />
      )}
    </Box>
  );
};

export default CalendarPage;
