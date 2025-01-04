import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  DirectionsCar,
  House,
} from '@mui/icons-material';
import { addDays, format, startOfWeek, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSupabase } from '../../hooks/useSupabase';
import { Vehicle, Bungalow, Reservation } from '../../types/supabase';

interface CalendarItem {
  id: string;
  name: string;
  type: 'vehicle' | 'bungalow';
  dailyRate: number;
  status: string;
}

export const CustomCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    availability: 'all',
  });
  const { fetchMany } = useSupabase();
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);

  const loadCalendarData = useCallback(async () => {
    try {
      // Charger les véhicules
      const vehicles = await fetchMany<Vehicle>('vehicles');
      const vehicleItems: CalendarItem[] = vehicles.map(vehicle => ({
        id: vehicle.id,
        name: `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`,
        type: 'vehicle',
        dailyRate: vehicle.daily_rate,
        status: vehicle.status,
      }));

      // Charger les bungalows
      const bungalows = await fetchMany<Bungalow>('bungalows');
      const bungalowItems: CalendarItem[] = bungalows.map(bungalow => ({
        id: bungalow.id,
        name: bungalow.name,
        type: 'bungalow',
        dailyRate: bungalow.daily_rate,
        status: bungalow.status,
      }));

      setItems([...vehicleItems, ...bungalowItems]);

      // Charger les réservations pour la semaine en cours
      const startDate = startOfWeek(currentDate, { locale: fr });
      const endDate = addDays(startDate, 7);
      
      const reservations = await fetchMany<Reservation>('reservations');
      setReservations(reservations);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [fetchMany, currentDate]);

  useEffect(() => {
    loadCalendarData();
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadCalendarData, 30000);
    return () => clearInterval(interval);
  }, [loadCalendarData]);

  const handleDragStart = (e: React.DragEvent, reservation: Reservation) => {
    dragItem.current = reservation;
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    dragOverItem.current = target.dataset.time;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current && dragOverItem.current) {
      try {
        const reservation = dragItem.current as Reservation;
        const newStartDate = new Date(dragOverItem.current);
        const duration = (new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24);
        const newEndDate = addDays(newStartDate, duration);

        await fetchMany('reservations', {
          id: reservation.id,
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString(),
        });

        await loadCalendarData();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la réservation:', error);
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const getFilteredItems = () => {
    return items.filter(item => {
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.availability !== 'all') {
        const isAvailable = item.status === 'available';
        if (filters.availability === 'available' && !isAvailable) return false;
        if (filters.availability === 'occupied' && isAvailable) return false;
      }
      return true;
    });
  };

  const getTimelineHeader = () => {
    const days = eachDayOfInterval({
      start: startOfWeek(currentDate, { locale: fr }),
      end: addDays(startOfWeek(currentDate, { locale: fr }), 6),
    });

    return (
      <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ width: 200, p: 1, borderRight: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">Ressources</Typography>
        </Box>
        {days.map(day => (
          <Box
            key={day.toString()}
            sx={{
              flex: 1,
              p: 1,
              textAlign: 'center',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="subtitle2">
              {format(day, 'EEEE dd/MM', { locale: fr })}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const getTimelineBody = () => {
    const days = eachDayOfInterval({
      start: startOfWeek(currentDate, { locale: fr }),
      end: addDays(startOfWeek(currentDate, { locale: fr }), 6),
    });

    return getFilteredItems().map(item => (
      <Box
        key={item.id}
        sx={{
          display: 'flex',
          borderBottom: 1,
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box
          sx={{
            width: 200,
            p: 1,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {item.type === 'vehicle' ? <DirectionsCar /> : <House />}
          <Typography variant="body2">{item.name}</Typography>
        </Box>
        {days.map(day => {
          const dayReservations = reservations.filter(
            res =>
              (res.vehicle_id === item.id || res.bungalow_id === item.id) &&
              new Date(res.start_date).toDateString() === day.toDateString()
          );

          return (
            <Box
              key={day.toString()}
              sx={{
                flex: 1,
                p: 1,
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: dayReservations.length > 0 ? 'primary.light' : 'transparent',
                cursor: 'pointer',
                minHeight: '50px',
              }}
              data-time={day.toISOString()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {dayReservations.map(res => (
                <Tooltip
                  key={res.id}
                  title={`Réservation du ${format(new Date(res.start_date), 'dd/MM')} au ${format(
                    new Date(res.end_date),
                    'dd/MM'
                  )}`}
                >
                  <Box
                    draggable
                    onDragStart={e => handleDragStart(e, res)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      p: 0.5,
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'move',
                    }}
                  >
                    <Typography variant="caption">
                      {format(new Date(res.start_date), 'HH:mm')} -{' '}
                      {format(new Date(res.end_date), 'HH:mm')}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          );
        })}
      </Box>
    ));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setCurrentDate(prev => addDays(prev, -7))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </Typography>
          <IconButton onClick={() => setCurrentDate(prev => addDays(prev, 7))}>
            <ChevronRight />
          </IconButton>
        </Box>
        
        <Grid container spacing={2} sx={{ width: 'auto' }}>
          <Grid item>
            <TextField
              select
              size="small"
              label="Type"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="vehicle">Véhicules</MenuItem>
              <MenuItem value="bungalow">Bungalows</MenuItem>
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              select
              size="small"
              label="Disponibilité"
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="available">Disponible</MenuItem>
              <MenuItem value="occupied">Occupé</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        {getTimelineHeader()}
        {getTimelineBody()}
      </Box>
    </Paper>
  );
};
