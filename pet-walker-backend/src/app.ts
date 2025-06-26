import express from 'express';
import rutas from './routes';

const app = express();

app.use(express.json()); 

app.use('/api', rutas);

export default app;
