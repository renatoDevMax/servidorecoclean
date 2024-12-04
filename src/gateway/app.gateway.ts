import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { BdServicesService } from '../modules/bd-services/bd-services.services';
import { entregasTipo } from 'src/types/entregasTypes';
import { clientesTipo } from 'src/types/clientesType';
import { usuarioTipo } from 'src/types/userTypes';
import { AppService } from '../app.service';
import { Client, Location } from 'whatsapp-web.js';

type MensagemSocket = {
  contato: string;
  mensagem: string;
};

type LocalizacaoSocket = {
  contato: string;
  coordenadas: {
    latitude: number;
    longitude: number;
  };
  nomeEntrega: string;
};

@WebSocketGateway({
  cors: {
    origin: '*', // Substitua pelo domínio do seu aplicativo Next.js
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('AppGateway');
  private server: Server; // Declare server here

  constructor(
    private readonly bdServicesService: BdServicesService,
    private readonly appService: AppService,
  ) {}

  /**Verficando as conexões com o usuário */
  afterInit(server: Server) {
    this.logger.log('Initialized');
    this.server = server;
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Cliente conectado: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Cliente desconectado: ' + client.id);
  }

  /**Processos pertinentes ao usuário */

  @SubscribeMessage('Autenticar Usuario')
  async handleAutenticarUsuario(client: Socket, usuario: any) {
    this.logger.log('Um usuário tentando logar...');
    const objetoAutenticate =
      await this.bdServicesService.autenticandoUsuario(usuario);
    this.logger.log('Usuario autenticado, pronto para uso');
    client.emit('Usuario Autenticado', objetoAutenticate.usuarioLogado);
  }

  @SubscribeMessage('Desconectar Usuario')
  handleDesconectarUsuario(client: Socket) {
    client.disconnect();
    this.logger.log('Um usuário abandonou a conexão');
  }

  @SubscribeMessage('Localizar Entregador')
  async handleLocalizarUsuario(client: Socket, usuario: usuarioTipo) {
    const todosUsuarios =
      await this.bdServicesService.atualizandoUsuarios(usuario);
    this.server.emit('todos-usuarios', todosUsuarios);
  }

  @SubscribeMessage('Buscar Entregas')
  async handleBuscarEntregas(client: Socket) {
    const minhasEntregas = await this.bdServicesService.entregasDoDia();
    console.log(
      `Entregas do dia resgatadas: ${minhasEntregas.length} entregas`,
    );
    client.emit('Atualizando entregas', minhasEntregas);
  }

  @SubscribeMessage('Buscar Clientes')
  async handleBuscarClientes(client: Socket) {
    const todosClientes = await this.bdServicesService.meusClientes();
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('Criar Entrega')
  async handleGerarEntrega(client: Socket, entregaNova: entregasTipo) {
    const entregasDoDia =
      await this.bdServicesService.criandoEntrega(entregaNova);
    const minhasEntregas = await this.bdServicesService.entregasDoDia();
    this.server.emit('Atualizando entregas', minhasEntregas);
  }

  @SubscribeMessage('Atualizar Entrega')
  async handleAtualizarEntrega(client: Socket, entregaUpdate: entregasTipo) {
    const todasEntregas =
      await this.bdServicesService.atualziandoEntregas(entregaUpdate);
    this.server.emit('Atualizando entregas', todasEntregas);
  }

  @SubscribeMessage('Deletar Entrega')
  async handleDeletarEntrega(client: Socket, entregaDelete: entregasTipo) {
    const todasEntregas =
      await this.bdServicesService.deletarEntrega(entregaDelete);
    this.server.emit('Atualizando entregas', todasEntregas);
  }

  @SubscribeMessage('Buscar Entregas Relatorio')
  async handleEntregasRelatorio(client: Socket) {
    const todasEntregasRel =
      await this.bdServicesService.todasEntregasRelatorio();
    client.emit('Atualizando entregas relatorio', todasEntregasRel);
  }

  @SubscribeMessage('Criar Cliente')
  async handleCriandoCliente(client: Socket, clienteRecebido: clientesTipo) {
    const todosClientes =
      await this.bdServicesService.criandoCliente(clienteRecebido);
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('Atualizar Cliente')
  async handleAtualizarCliente(client: Socket, clienteRecebido: clientesTipo) {
    const todosClientes =
      await this.bdServicesService.atualizandoCliente(clienteRecebido);
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('Deletar Cliente')
  async handleDeletarCliente(client: Socket, clienteRecebido: clientesTipo) {
    const todosClientes =
      await this.bdServicesService.deletandoCliente(clienteRecebido);
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('solicitar-usuarios')
  async handleSolicitarUsuarios(client: Socket) {
    const todosClientes = await this.bdServicesService.todosUsuariosBanco();
    client.emit('todos-usuarios', todosClientes);
  }

  @SubscribeMessage('enviar-whatsapp')
  async handleEnviarWhatsapp(
    client: Socket,
    dados: { numero: string; mensagem: string },
  ) {
    try {
      const whatsapp = this.appService.getClient();
      await whatsapp.sendMessage(`${dados.numero}@c.us`, dados.mensagem);
      return { success: true, message: 'Mensagem enviada com sucesso!' };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao enviar mensagem: ' + error.message,
      };
    }
  }

  @SubscribeMessage('Enviar Mensagem')
  async handleEnviarMensagem(
    client: Socket,
    dados: MensagemSocket,
  ): Promise<{ mensagemEnviada: boolean }> {
    try {
      const whatsapp = this.appService.getClient();

      // Verifica se o número já tem o @c.us, se não tiver, adiciona
      const numeroFormatado = dados.contato.includes('@c.us')
        ? dados.contato
        : `${dados.contato}@c.us`;

      await whatsapp.sendMessage(numeroFormatado, dados.mensagem);

      console.log(`Mensagem enviada com sucesso para ${dados.contato}`);
      return { mensagemEnviada: true };
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${dados.contato}:`, error);
      return { mensagemEnviada: false };
    }
  }

  @SubscribeMessage('Obter Localizacao')
  async handleObterLocalizacao(
    client: Socket,
    dados: LocalizacaoSocket,
  ): Promise<{ enviarLocalizacao: boolean }> {
    try {
      const whatsapp = this.appService.getClient();

      // Verifica se o número já tem o @c.us, se não tiver, adiciona
      const numeroFormatado = dados.contato.includes('@c.us')
        ? dados.contato
        : `${dados.contato}@c.us`;

      // Envia a localização
      await whatsapp.sendMessage(
        numeroFormatado,
        new Location(dados.coordenadas.latitude, dados.coordenadas.longitude),
      );

      // Envia a mensagem com o nome da entrega
      await whatsapp.sendMessage(
        numeroFormatado,
        `Essa entrega é para: ${dados.nomeEntrega}.`,
      );

      console.log(`Localização enviada com sucesso para ${dados.contato}`);
      return { enviarLocalizacao: true };
    } catch (error) {
      console.error(`Erro ao enviar localização para ${dados.contato}:`, error);
      return { enviarLocalizacao: false };
    }
  }

  //Adicionando algum comentario apenas para garantir o commit

  // @SubscribeMessage('Mensagem Chegada Cliente')
  // handleMensagemChegadaCliente(client: Socket, dadosMensagem: any) {
  //   this.bdServicesService.enviandoMensagem(dadosMensagem);
  // }

  // @SubscribeMessage('Localizacao Entrega')
  // handleLocalizacaoEntrega(client: Socket, dadosObj: any) {
  //   this.bdServicesService.localzacaoEntrega(
  //     dadosObj.entrega,
  //     dadosObj.dadosMensagem,
  //   );
  // }

  // Adicione mais handlers aqui conforme necessário
}
