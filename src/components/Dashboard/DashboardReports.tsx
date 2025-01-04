import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../lib/formatUtils';

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
      id={`reports-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ReportProps {
  seasonality: Array<{
    month: string;
    vehicules: number;
    bungalows: number;
    tauxOccupation: number;
  }>;
  clientProfiles: Array<{
    type: string;
    count: number;
  }>;
  performance: Array<{
    category: string;
    revenue: number;
    occupation: number;
  }>;
  predictions: Array<{
    period: string;
    revenuPrevu: number;
    tauxOccupationPrevu: number;
  }>;
}

export const DashboardReports = ({
  seasonality,
  clientProfiles,
  performance,
  predictions
}: ReportProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs 
          value={value} 
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center'
            }
          }}
        >
          <Tab label="Saisonnalité" />
          <Tab label="Profils Clients" />
          <Tab label="Performance" />
          <Tab label="Prévisions" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Analyse Saisonnière
          </Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart 
                data={seasonality}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="vehicules" name="Véhicules" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="bungalows" name="Bungalows" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="tauxOccupation" name="Taux d'Occupation (%)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Profils des Clients
          </Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={clientProfiles}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label
                >
                  {clientProfiles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Performance par Catégorie
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {performance.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom align="center">
                      {item.category}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                        Revenu: {formatCurrency(item.revenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                        Taux d'occupation: {item.occupation}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.occupation} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Prévisions
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {predictions.map((prediction, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom align="center">
                      {prediction.period}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                        Revenu Prévu
                      </Typography>
                      <Typography variant="h6" align="center">
                        {formatCurrency(prediction.revenuPrevu)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom align="center">
                        Taux d'Occupation Prévu
                      </Typography>
                      <Box sx={{ px: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={prediction.tauxOccupationPrevu} 
                          sx={{ height: 10, borderRadius: 5, mb: 1 }}
                        />
                        <Typography variant="body2" align="center">
                          {prediction.tauxOccupationPrevu}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>
    </Box>
  );
};
