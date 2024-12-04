import { entregaSchema } from '../modules/bd-schemas/entregaModels';
import mongoose from 'mongoose';

// Create the model instance outside the function

const dataConectEntregas = async () => {
  const uri =
    'mongodb+srv://renatomaximianojr:R1FL4X6xFM9xE2aX@clusterrenato.asbtntk.mongodb.net/ecoClean?retryWrites=true&w=majority&appName=clusterRenato';
  const clientOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  } as mongoose.ConnectOptions;

  const conn = await mongoose.createConnection(uri, clientOptions).asPromise();
  await conn.model('entregas', entregaSchema, 'entregaschemas');
  console.log('Conectado ao Banco de Dados: Entregas.');
  return conn;
};

export const fechandoBanco = async () => {
  await mongoose.disconnect();
};

export default dataConectEntregas;
