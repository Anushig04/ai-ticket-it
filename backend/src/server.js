import { crearApp } from './app.js';

const PORT = process.env.PORT || 3000;
const app = crearApp({ inicializarSeed: true });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AI Ticket It escuchando en http://localhost:${PORT}`);
});