import { Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Container } from '@mui/material';
import { DirectionsCar, House, BookOnline, TrendingUp, Person } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { formatCurrency } from '../../lib/formatUtils';
import { formatDate } from '../../lib/dateUtils';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardCharts } from '../../components/Dashboard/DashboardCharts';
import { DashboardAlerts } from '../../components/Dashboard/DashboardAlerts';
import { DashboardReports } from '../../components/Dashboard/DashboardReports';

const StatCard = ({ title, value, icon, subtitle }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  subtitle?: string;
}) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography color="text.secondary">{title}</Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
    {subtitle && (
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    vehiclesAvailable: '0/0',
    bungalowsAvailable: '0/0',
    todayReservations: 0,
    monthlyRevenue: 0,
    totalCustomers: 0
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    revenueData: [],
    occupationData: [],
    reservationsData: []
  });
  const [alerts, setAlerts] = useState([]);
  const [reportData, setReportData] = useState({
    seasonality: [],
    clientProfiles: [],
    performance: [],
    predictions: []
  });
  const { supabase } = useSupabase();

  useEffect(() => {
    console.log('Dashboard mounted, loading data...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentDate = new Date();
      const today = currentDate.toISOString().split('T')[0];
      
      // Charger les réservations du jour
      console.log('Fetching today reservations...');
      const { data: todayReservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicle_id,
          bungalow_id
        `)
        .or(`and(start_date.lte.${today}T23:59:59,end_date.gte.${today}T00:00:00)`);

      if (reservationsError) throw reservationsError;
      console.log('Today reservations:', todayReservations);

      // Extraire les IDs des ressources réservées aujourd'hui
      const reservedVehicleIds = todayReservations
        ?.filter(r => r.vehicle_id)
        .map(r => r.vehicle_id) || [];
      
      const reservedBungalowIds = todayReservations
        ?.filter(r => r.bungalow_id)
        .map(r => r.bungalow_id) || [];

      console.log('Fetching vehicles...');
      // Charger les statistiques des véhicules
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;
      console.log('Vehicles data:', vehicles);

      const availableVehicles = vehicles?.filter(v => 
        v.status === 'available' && !reservedVehicleIds.includes(v.id)
      ).length || 0;
      const totalVehicles = vehicles?.length || 0;

      console.log('Fetching bungalows...');
      // Charger les statistiques des bungalows
      const { data: bungalows, error: bungalowsError } = await supabase
        .from('bungalows')
        .select('*');

      if (bungalowsError) throw bungalowsError;
      console.log('Bungalows data:', bungalows);

      const availableBungalows = bungalows?.filter(b => 
        b.status === 'available' && !reservedBungalowIds.includes(b.id)
      ).length || 0;
      const totalBungalows = bungalows?.length || 0;

      console.log('Fetching monthly payments...');
      // Charger les revenus du mois
      const currentMonth = format(currentDate, 'yyyy-MM');
      const { data: monthlyPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', `${currentMonth}-01`)
        .lte('payment_date', `${currentMonth}-31`);

      if (paymentsError) throw paymentsError;
      console.log('Monthly payments:', monthlyPayments);

      const revenue = monthlyPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      console.log('Fetching clients...');
      // Charger le nombre total de clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;
      console.log('Clients data:', clients);

      // Mettre à jour les statistiques
      const newStats = {
        vehiclesAvailable: `${availableVehicles}/${totalVehicles}`,
        bungalowsAvailable: `${availableBungalows}/${totalBungalows}`,
        todayReservations: todayReservations?.length || 0,
        monthlyRevenue: revenue,
        totalCustomers: clients?.length || 0
      };
      console.log('Setting new stats:', newStats);
      setStats(newStats);

      // Charger les données pour les graphiques
      console.log('Calculating chart data...');
      
      // Calculer les 6 derniers mois
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        return format(date, 'yyyy-MM');
      }).reverse();

      // Charger les revenus des 6 derniers mois
      const revenuePromises = last6Months.map(async month => {
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', `${month}-01`)
          .lte('payment_date', `${month}-31`);
        
        const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        return {
          date: month,
          vehicules: monthlyRevenue * 0.6, // Estimation de la répartition
          bungalows: monthlyRevenue * 0.4
        };
      });

      const revenueData = await Promise.all(revenuePromises);

      // Calculer le taux d'occupation actuel
      const occupationData = [
        { 
          name: 'Véhicules Occupés', 
          value: totalVehicles ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 : 0 
        },
        { 
          name: 'Véhicules Libres', 
          value: totalVehicles ? (availableVehicles / totalVehicles) * 100 : 0 
        },
        { 
          name: 'Bungalows Occupés', 
          value: totalBungalows ? ((totalBungalows - availableBungalows) / totalBungalows) * 100 : 0 
        },
        { 
          name: 'Bungalows Libres', 
          value: totalBungalows ? (availableBungalows / totalBungalows) * 100 : 0 
        }
      ];

      // Charger les réservations mensuelles des 6 derniers mois
      const reservationsPromises = last6Months.map(async month => {
        const { data: monthReservations } = await supabase
          .from('reservations')
          .select('id, vehicle_id, bungalow_id')
          .or(
            `and(start_date.gte.${month}-01,start_date.lte.${month}-31),` +
            `and(end_date.gte.${month}-01,end_date.lte.${month}-31)`
          );

        return {
          mois: month,
          vehicules: monthReservations?.filter(r => r.vehicle_id).length || 0,
          bungalows: monthReservations?.filter(r => r.bungalow_id).length || 0
        };
      });

      const reservationsData = await Promise.all(reservationsPromises);

      console.log('Setting chart data:', {
        revenueData,
        occupationData,
        reservationsData
      });

      setChartData({
        revenueData,
        occupationData,
        reservationsData
      });

      // Charger les réservations récentes (derniers 7 jours)
      console.log('Fetching recent reservations...');
      const { data: recentReservs, error: recentReservError } = await supabase
        .from('reservations')
        .select(`
          *,
          clients (
            first_name,
            last_name
          ),
          vehicles (
            brand,
            model,
            license_plate
          ),
          bungalows (
            name
          )
        `)
        .gte('created_at', subDays(currentDate, 7).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentReservError) throw recentReservError;
      console.log('Recent reservations:', recentReservs);

      setRecentReservations(recentReservs || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <Box 
      component="main"
      sx={{ 
        flexGrow: 1,
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        p: 3,
        backgroundColor: '#f5f5f5'
      }}
    >
      <Container maxWidth={false} sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Statistiques */}
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Véhicules Disponibles"
              value={stats.vehiclesAvailable}
              icon={<DirectionsCar />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Bungalows Disponibles"
              value={stats.bungalowsAvailable}
              icon={<House />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Réservations du Jour"
              value={stats.todayReservations.toString()}
              icon={<BookOnline />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Revenu Mensuel"
              value={formatCurrency(stats.monthlyRevenue)}
              icon={<TrendingUp />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Clients"
              value={stats.totalCustomers.toString()}
              icon={<Person />}
            />
          </Grid>

          {/* Graphiques */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 0, 
                display: 'flex', 
                flexDirection: 'column',
                height: 'auto',
                minHeight: 600,
                overflow: 'hidden'
              }}
            >
              <DashboardCharts 
                revenueData={chartData.revenueData} 
                occupationData={chartData.occupationData}
                reservationsData={chartData.reservationsData}
              />
            </Paper>
          </Grid>

          {/* Rapports */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 0,
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 500,
                overflow: 'hidden'
              }}
            >
              <DashboardReports 
                seasonality={reportData.seasonality}
                clientProfiles={reportData.clientProfiles}
                performance={reportData.performance}
                predictions={reportData.predictions}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
