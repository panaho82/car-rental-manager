import React, { useEffect, useState, useRef } from 'react';
import { format, addDays, parseISO, startOfDay, endOfDay, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import './WeekTimeline.css';
import { supabase } from '../../lib/supabase';

interface Resource {
  id: string;
  name: string;
  type: 'vehicle' | 'bungalow';
  image_url?: string;
  license_plate?: string;
}

interface Reservation {
  id: string;
  vehicle_id?: string;
  bungalow_id?: string;
  start_date: string;
  end_date: string;
  client_name: string;
  status: string;
  reservation_number: string;
}

interface WeekTimelineProps {
  resources: Resource[];
  startDate?: Date;
  endDate?: Date;
}

const WeekTimeline: React.FC<WeekTimelineProps> = ({ 
  resources, 
  startDate = new Date(), 
  endDate = addDays(startDate, 7) 
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeReservation, setActiveReservation] = useState<string | null>(null);
  const dragStartX = useRef<number>(0);
  const originalLeft = useRef<number>(0);
  const originalWidth = useRef<number>(0);

  useEffect(() => {
    console.log('Resources changed:', resources); // Debug log
    fetchReservations();

    // Mettre en place l'abonnement aux changements de réservations
    const subscription = supabase
      .channel('reservations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('Reservation change detected:', payload);
          fetchReservations();
        }
      )
      .subscribe();

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      subscription.unsubscribe();
    };
  }, [resources, startDate, endDate]);

  const fetchReservations = async () => {
    try {
      console.log('Fetching reservations for date range:', {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      // Récupérer toutes les réservations (véhicules et bungalows)
      const { data: allReservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          id,
          vehicle_id,
          bungalow_id,
          start_date,
          end_date,
          status,
          reservation_number,
          clients (
            first_name,
            last_name
          )
        `);
        // Suppression des filtres de date pour déboguer
        // .gte('start_date', startDate.toISOString())
        // .lte('end_date', endDate.toISOString());

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError);
        return;
      }

      console.log('Fetched reservations:', allReservations);

      // Transformer les réservations pour l'affichage
      const formattedReservations = allReservations.map(reservation => ({
        id: reservation.id,
        vehicle_id: reservation.vehicle_id,
        bungalow_id: reservation.bungalow_id,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        client_name: reservation.clients 
          ? `${reservation.clients.first_name} ${reservation.clients.last_name}`
          : 'Client inconnu',
        status: reservation.status,
        reservation_number: reservation.reservation_number
      }));

      console.log('Formatted reservations:', formattedReservations);
      setReservations(formattedReservations);
      
    } catch (error) {
      console.error('Error in fetchReservations:', error);
    }
  };

  const handleDragStart = (e: React.MouseEvent, reservation: Reservation) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveReservation(reservation.id);
    dragStartX.current = e.clientX;
    const element = e.currentTarget as HTMLElement;
    originalLeft.current = parseFloat(element.style.left);
  };

  const handleResizeStart = (e: React.MouseEvent, reservation: Reservation) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveReservation(reservation.id);
    dragStartX.current = e.clientX;
    const element = e.currentTarget.parentElement as HTMLElement;
    originalWidth.current = parseFloat(element.style.width);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const timelineWidth = document.querySelector('.timeline-week')?.clientWidth || 0;
    const pixelsPerDay = timelineWidth / 7;
    const deltaX = e.clientX - dragStartX.current;
    const deltaPercentage = (deltaX / timelineWidth) * 100;

    if (isDragging && activeReservation) {
      const newLeft = Math.max(0, Math.min(100 - originalWidth.current, originalLeft.current + deltaPercentage));
      const element = document.querySelector(`[data-reservation-id="${activeReservation}"]`) as HTMLElement;
      if (element) {
        element.style.left = `${newLeft}%`;
      }
    }

    if (isResizing && activeReservation) {
      const newWidth = Math.max(pixelsPerDay / timelineWidth * 100, Math.min(100 - originalLeft.current, originalWidth.current + deltaPercentage));
      const element = document.querySelector(`[data-reservation-id="${activeReservation}"]`) as HTMLElement;
      if (element) {
        element.style.width = `${newWidth}%`;
      }
    }
  };

  const handleMouseUp = async () => {
    if (!activeReservation || (!isDragging && !isResizing)) return;

    const element = document.querySelector(`[data-reservation-id="${activeReservation}"]`) as HTMLElement;
    if (!element) return;

    const timelineWidth = document.querySelector('.timeline-week')?.clientWidth || 0;
    const weekStart = startOfDay(startDate);
    const weekDuration = endOfDay(addDays(startDate, 6)).getTime() - weekStart.getTime();

    const left = parseFloat(element.style.left);
    const width = parseFloat(element.style.width);

    const startOffset = (left / 100) * weekDuration;
    const durationMs = (width / 100) * weekDuration;

    const newStartDate = new Date(weekStart.getTime() + startOffset);
    const newEndDate = new Date(newStartDate.getTime() + durationMs);

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString()
        })
        .eq('id', activeReservation);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reservation:', error);
      // Recharger les réservations pour revenir à l'état précédent
      fetchReservations();
    }

    setIsDragging(false);
    setIsResizing(false);
    setActiveReservation(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeReservation, isDragging, isResizing]);

  // Générer les dates pour les 7 prochains jours
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getReservationPosition = (
    reservation: Reservation,
    startDate: Date
  ) => {
    const reservationStart = parseISO(reservation.start_date);
    const reservationEnd = parseISO(reservation.end_date);
    const weekStart = startOfDay(startDate);
    const weekEnd = endOfDay(addDays(startDate, 6));

    // Calculer la position et la largeur de la réservation sur toute la semaine
    const start = Math.max(reservationStart.getTime(), weekStart.getTime());
    const end = Math.min(reservationEnd.getTime(), weekEnd.getTime());
    const weekDuration = weekEnd.getTime() - weekStart.getTime();
    
    const left = ((start - weekStart.getTime()) / weekDuration) * 100;
    const width = ((end - start) / weekDuration) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const isReservationInWeek = (
    reservation: Reservation,
    startDate: Date,
    resource: Resource
  ) => {
    const reservationStart = parseISO(reservation.start_date);
    const reservationEnd = parseISO(reservation.end_date);
    const weekStart = startOfDay(startDate);
    const weekEnd = endOfDay(addDays(startDate, 6));

    // Vérifier si la réservation correspond à la ressource
    const resourceMatch = 
      (resource.type === 'vehicle' && reservation.vehicle_id === resource.id) ||
      (resource.type === 'bungalow' && reservation.bungalow_id === resource.id);

    // Vérifier si la réservation chevauche la semaine
    const timeOverlap = 
      (reservationStart <= weekEnd) && (reservationEnd >= weekStart);

    return resourceMatch && timeOverlap;
  };

  const getReservationStyle = (reservation: Reservation) => {
    switch (reservation.status) {
      case 'confirmed':
        return 'confirmed-reservation';
      case 'pending':
        return 'pending-reservation';
      default:
        return 'default-reservation';
    }
  };

  // Trier les ressources pour mettre les bungalows en premier
  const sortedResources = [...resources].sort((a, b) => {
    if (a.type === 'bungalow' && b.type === 'vehicle') return -1;
    if (a.type === 'vehicle' && b.type === 'bungalow') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div 
      className="calendar-container"
      onMouseMove={handleMouseMove}
    >
      <div className="timeline-container">
        <div className="timeline-header">
          <div className="header-row">
            <div className="resource-header">Ressources</div>
            <div className="dates-row">
              {dates.map((date) => (
                <div key={date.toISOString()} className="date-cell">
                  <div className="date-info">
                    {format(date, 'EEE dd MMM', { locale: fr })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="timeline-body">
          {sortedResources.map((resource) => (
            <div key={resource.id} className="resource-row">
              <div className="resource-info">
                <div className="resource-details">
                  {resource.type === 'vehicle' ? (
                    <>
                      <div className="resource-name">{resource.name}</div>
                      <div className="resource-plate">{resource.license_plate}</div>
                    </>
                  ) : (
                    <div className="resource-name">{resource.name}</div>
                  )}
                </div>
              </div>
              <div className="dates-row">
                <div className="timeline-week">
                  {reservations
                    .filter(reservation => 
                      isReservationInWeek(reservation, startDate, resource)
                    )
                    .map(reservation => {
                      const position = getReservationPosition(reservation, startDate);
                      return (
                        <div
                          key={reservation.id}
                          data-reservation-id={reservation.id}
                          className={`reservation ${getReservationStyle(reservation)} ${activeReservation === reservation.id ? 'active' : ''}`}
                          style={{
                            left: position.left,
                            width: position.width,
                            cursor: isDragging ? 'grabbing' : 'grab'
                          }}
                          onMouseDown={(e) => handleDragStart(e, reservation)}
                          title={`${reservation.reservation_number}
${reservation.client_name}
Du: ${format(parseISO(reservation.start_date), 'dd/MM HH:mm')}
Au: ${format(parseISO(reservation.end_date), 'dd/MM HH:mm')}`}
                        >
                          <div className="reservation-content">
                            <div className="reservation-header">
                              <span className="reservation-number">#{reservation.reservation_number}</span>
                              <span className="reservation-time">
                                {format(parseISO(reservation.start_date), 'HH:mm')}
                                -
                                {format(parseISO(reservation.end_date), 'HH:mm')}
                              </span>
                            </div>
                            <div className="reservation-client-name">
                              {reservation.client_name}
                            </div>
                          </div>
                          <div 
                            className="resize-handle"
                            onMouseDown={(e) => handleResizeStart(e, reservation)}
                          />
                        </div>
                      );
                    })}
                </div>
                {dates.map((date) => (
                  <div key={date.toISOString()} className="date-cell" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekTimeline;
