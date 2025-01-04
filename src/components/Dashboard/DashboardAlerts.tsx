import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import {
  NotificationsActive,
  DirectionsCar,
  House,
  Build,
  CleaningServices,
} from '@mui/icons-material';
import { formatDate } from '../../lib/dateUtils';

interface Alert {
  id: string;
  type: 'reservation' | 'return' | 'checkout' | 'maintenance' | 'cleaning';
  message: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'reservation':
      return <NotificationsActive color="primary" />;
    case 'return':
      return <DirectionsCar color="secondary" />;
    case 'checkout':
      return <House color="info" />;
    case 'maintenance':
      return <Build color="warning" />;
    case 'cleaning':
      return <CleaningServices color="success" />;
  }
};

const getPriorityColor = (priority: Alert['priority']) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

export const DashboardAlerts = ({ alerts }: { alerts: Alert[] }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationsActive />
        Alertes et notifications
      </Typography>
      <List>
        {alerts.map((alert) => (
          <ListItem
            key={alert.id}
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <ListItemIcon>
              {getAlertIcon(alert.type)}
            </ListItemIcon>
            <ListItemText
              primary={alert.message}
              secondary={formatDate(alert.date)}
            />
            <Chip
              label={alert.priority.toUpperCase()}
              color={getPriorityColor(alert.priority)}
              size="small"
              sx={{ ml: 2 }}
            />
          </ListItem>
        ))}
        {alerts.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Aucune alerte pour le moment"
              secondary="Tout est en ordre"
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};
