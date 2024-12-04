export type usuarioTipo = {
  id?: string;
  userName: string;
  senha: string;
  status: string;
  localizacao: {
    latitude: number;
    longitude: number;
  };
};
