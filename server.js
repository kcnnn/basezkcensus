import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (in production, use a database)
const censusData = new Map(); // Map<address, { nationality: string, timestamp: number }>
const countryCounts = new Map(); // Map<nationality, count>

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API endpoint to submit census data
app.post('/api/submit', (req, res) => {
  const { address, nationality } = req.body;
  
  if (!address || !nationality) {
    return res.status(400).json({ error: 'Address and nationality are required' });
  }
  
  // Store the data
  censusData.set(address.toLowerCase(), {
    nationality,
    timestamp: Date.now()
  });
  
  // Update country counts
  const currentCount = countryCounts.get(nationality) || 0;
  countryCounts.set(nationality, currentCount + 1);
  
  res.json({ success: true });
});

// API endpoint to get census statistics
app.get('/api/census', (req, res) => {
  const countries = Array.from(countryCounts.entries()).map(([country, count]) => ({
    country,
    count
  }));
  
  // Sort by count descending, then by country name
  countries.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.country.localeCompare(b.country);
  });
  
  res.json({ countries, total: censusData.size });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

