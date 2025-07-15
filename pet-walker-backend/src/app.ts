import express from 'express';
import cors from 'cors';
import rutas from './routes';

const app = express();

// Configuración básica de CORS (como en el inicio)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json()); 

app.use('/api', rutas);

export default app;
