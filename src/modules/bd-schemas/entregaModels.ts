import mongoose from "mongoose";

export const entregaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  dia: { type: [Number, Number, Number], required: true },
  status: { type: String, required: true },
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  cidade: { type: String, required: true },
  bairro: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: String, required: true },
  coordenadas: {
    type: {
      latitude: Number,
      longitude: Number,
    },
    required: true,
  },
  valor: { type: String, required: true },
  pagamento: { type: String, required: true },
  entregador: { type: String, required: true },
  volume: { type: String, required: true },
});
