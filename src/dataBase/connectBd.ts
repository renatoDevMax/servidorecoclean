import mongoose, { ConnectOptions, Connection } from 'mongoose';
import { entregaSchema } from '../modules/bd-schemas/entregaModels';

let conn: Connection | null = null;

const connectToDatabase = async (): Promise<Connection> => {
  if (!conn) {
    const uri: string =
      'mongodb+srv://renatomaximianojr:R1FL4X6xFM9xE2aX@clusterrenato.asbtntk.mongodb.net/ecoClean?retryWrites=true&w=majority&appName=clusterRenato';
    const clientOptions: ConnectOptions = {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    } as ConnectOptions;

    try {
      await mongoose.connect(uri, clientOptions);
      conn = mongoose.connection;
      console.log('Conectado ao Banco de Dados.');
    } catch (error) {
      console.error('Erro ao conectar ao Banco de Dados:', error);
      throw new Error('Falha na conexão com o banco de dados');
    }
  }
  return conn;
};

export { connectToDatabase };
