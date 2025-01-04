import { Paper, Typography, Box, Grid } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../lib/formatUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

interface ChartProps {
  revenueData: Array<{
    date: string;
    vehicules: number;
    bungalows: number;
  }>;
  occupationData: Array<{
    name: string;
    value: number;
  }>;
  reservationsData: Array<{
    mois: string;
    vehicules: number;
    bungalows: number;
  }>;
}

export const DashboardCharts = ({
  revenueData,
  occupationData,
  reservationsData,
}: ChartProps) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Graphique des revenus */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom align="center">
          Évolution des Revenus
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="vehicules"
                name="Véhicules"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="bungalows"
                name="Bungalows"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Taux d'occupation */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 300 }}>
            <Typography variant="h6" gutterBottom align="center">
              Taux d'Occupation Actuel
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={occupationData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  cx="50%"
                  cy="40%"
                  label={({ value }) => formatPercentage(value)}
                >
                  {occupationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPercentage(Number(value))} />
                <Legend 
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  formatter={(value, entry) => `${value} (${formatPercentage(entry.payload.value)})`}
                  wrapperStyle={{
                    bottom: '10%',
                    width: '100%'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Réservations mensuelles */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 300 }}>
            <Typography variant="h6" gutterBottom align="center">
              Réservations Mensuelles
            </Typography>
            <ResponsiveContainer>
              <BarChart data={reservationsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="vehicules" name="Véhicules" fill="#8884d8" />
                <Bar dataKey="bungalows" name="Bungalows" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
