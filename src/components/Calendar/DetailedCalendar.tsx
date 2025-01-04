import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, isSameDay, getHours, getMinutes, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSupabase } from '../../hooks/useSupabase';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './TimelineStyles.css';

interface Resource {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  type: 'bungalow' | 'vehicle';
}

interface Event {
  id: string;
  title: string;
  clientName: string;
  start: string;
  end: string;
  resourceId: string;
  status?: string;
  reservationNumber: string;
}

export const DetailedCalendar = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // Commencer la semaine le lundi
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { supabase } = useSupabase();

  // Calculer les jours de la semaine
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentDate, i));
    }
    return days;
  }, [currentDate]);

  const loadData = useCallback(async () => {
    console.log('Chargement des données...');
    try {
      // Charger les véhicules
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, brand, model, license_plate, status')
        .eq('status', 'available');

      if (vehiclesError) throw vehiclesError;

      // Charger les bungalows
      const { data: bungalows, error: bungalowsError } = await supabase
        .from('bungalows')
        .select('id, name, status')
        .eq('status', 'available');

      if (bungalowsError) throw bungalowsError;

      // Transformer les données en ressources
      const vehicleResources: Resource[] = vehicles.map(vehicle => ({
        id: vehicle.id,
        title: `${vehicle.brand} ${vehicle.model}`,
        subtitle: vehicle.license_plate,
        type: 'vehicle'
      }));

      const bungalowResources: Resource[] = bungalows.map(bungalow => ({
        id: bungalow.id,
        title: bungalow.name,
        type: 'bungalow'
      }));

      // Combiner les ressources
      setResources([...vehicleResources, ...bungalowResources]);

      // Charger les réservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          id,
          start_date,
          end_date,
          vehicle_id,
          bungalow_id,
          status,
          clients (
            first_name,
            last_name
          )
        `);

      if (reservationsError) throw reservationsError;

      // Transformer les réservations en événements
      const transformedEvents: Event[] = reservations.map(reservation => ({
        id: reservation.id,
        title: `Réservation`,
        clientName: `${reservation.clients.first_name} ${reservation.clients.last_name}`,
        start: reservation.start_date,
        end: reservation.end_date,
        resourceId: reservation.vehicle_id || reservation.bungalow_id,
        status: reservation.status,
        reservationNumber: reservation.id
      }));

      setEvents(transformedEvents);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [supabase]);

  // Écouter les changements de réservations
  useEffect(() => {
    const channel = supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        () => {
          console.log('Changement détecté dans les réservations');
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Charger les données initiales et lors des changements
  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handlePreviousWeek = () => {
    setCurrentDate(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(date => startOfWeek(addMonths(date, -1), { weekStartsOn: 1 }));
  };

  const handleNextMonth = () => {
    setCurrentDate(date => startOfWeek(addMonths(date, 1), { weekStartsOn: 1 }));
  };

  const HOURS_PER_DAY = 24;
  const SLOTS_PER_DAY = 4;
  const SLOT_WIDTH = 50; 
  const DAY_WIDTH = SLOT_WIDTH * SLOTS_PER_DAY;
  const TOTAL_WIDTH = DAY_WIDTH * 7; // 7 jours

  const calculateEventStyle = (startDate: Date, endDate: Date) => {
    // Trouver le jour de la semaine (0-6)
    const dayIndex = weekDays.findIndex(day => 
      isSameDay(day, startDate)
    );
    
    if (dayIndex === -1) return null;

    const startHour = getHours(startDate) + getMinutes(startDate) / 60;
    const endHour = getHours(endDate) + getMinutes(endDate) / 60;
    
    // Position dans le jour (0-1)
    const dayStart = startHour / 24;
    const dayEnd = endHour / 24;
    
    // Position absolue dans la timeline
    const left = (dayIndex * DAY_WIDTH) + (dayStart * DAY_WIDTH);
    const width = ((dayEnd - dayStart) * DAY_WIDTH);
    
    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  };

  // Générer les marqueurs d'heures
  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
      markers.push(
        <div
          key={hour}
          style={{
            position: 'absolute',
            left: `${hour * SLOTS_PER_DAY * SLOT_WIDTH}px`,
            width: '1px',
            height: '100%',
            backgroundColor: hour % 2 === 0 ? '#ddd' : '#eee',
            zIndex: 0
          }}
        >
          <Typography variant="caption" style={{ position: 'absolute', top: -20, left: 2 }}>
            {`${hour.toString().padStart(2, '0')}:00`}
          </Typography>
        </div>
      );
    }
    return markers;
  }, []);

  return (
    <div className="timeline-container">
      <div className="timeline-navigation">
        <div className="nav-group">
          <Tooltip title="Mois précédent">
            <IconButton onClick={handlePreviousMonth}>
              <ChevronLeftIcon />
              <ChevronLeftIcon style={{ marginLeft: -12 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Semaine précédente">
            <IconButton onClick={handlePreviousWeek}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Aujourd'hui">
            <IconButton onClick={handleToday}>
              <Typography variant="button" style={{ padding: '0 8px' }}>
                Aujourd'hui
              </Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Semaine suivante">
            <IconButton onClick={handleNextWeek}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mois suivant">
            <IconButton onClick={handleNextMonth}>
              <ChevronRightIcon />
              <ChevronRightIcon style={{ marginLeft: -12 }} />
            </IconButton>
          </Tooltip>
        </div>
        <Typography variant="h6">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </Typography>
      </div>

      <div className="timeline-header">
        <div className="resources-column">
          <div className="resource-label">Ressources</div>
        </div>
        <div className="timeline-grid">
          <div className="days-header">
            {weekDays.map(day => (
              <div key={day.toISOString()} className="day-column">
                <div className="day-header">
                  <div className="day-name">{format(day, 'EEEE', { locale: fr })}</div>
                  <div className="day-date">{format(day, 'd MMM', { locale: fr })}</div>
                </div>
                <div className="time-slots">
                  {hourMarkers}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="timeline-content">
        <div className="resources-column">
          {resources.map(resource => (
            <div key={resource.id} className="resource-row">
              <div className="resource-label">
                {resource.title}
                {resource.subtitle && (
                  <div className="resource-subtitle">{resource.subtitle}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-grid">
          <div className="timeline-rows" style={{ width: `${TOTAL_WIDTH}px`, position: 'relative' }}>
            {/* Grille de fond avec les créneaux horaires */}
            {weekDays.map((day, index) => (
              <div key={day.toISOString()} className="day-timeline" style={{ left: `${index * DAY_WIDTH}px` }}>
                <div className="timeline-slots">
                  {Array.from({ length: SLOTS_PER_DAY }, (_, i) => (
                    <div key={i} className="timeline-slot"></div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Lignes des ressources avec les événements */}
            {resources.map(resource => (
              <div key={resource.id} className="resource-row">
                {events
                  .filter(event => event.resourceId === resource.id)
                  .map(event => {
                    const startDate = parseISO(event.start);
                    const endDate = parseISO(event.end);
                    const style = calculateEventStyle(startDate, endDate);
                    if (!style) return null;
                    
                    return (
                      <div
                        key={event.id}
                        className={`event ${event.status?.toLowerCase() || ''}`}
                        style={style}
                        onClick={() => console.log('Event clicked:', event)}
                      >
                        <div className="event-title">{event.reservationNumber}</div>
                        <div className="event-subtitle">{event.clientName}</div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
