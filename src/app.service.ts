import { Injectable } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';

@Injectable()
export class AppService {
  private client: Client;
  private isReady: boolean = false;
  private qrCode: string = null;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-extensions',
          '--disable-features=site-per-process',
          '--enable-features=NetworkService',
          '--allow-running-insecure-content',
          '--disable-web-security',
        ],
        executablePath: process.env.CHROME_BIN || undefined,
        browserWSEndpoint: process.env.BROWSER_WSS || undefined,
      },
    });

    this.client.on('qr', (qr) => {
      console.log('Novo QR Code recebido');
      this.qrCode = qr;
    });

    this.client.on('ready', async () => {
      console.log('Cliente WhatsApp está pronto!');
      this.isReady = true;
      this.qrCode = null;

      try {
        await this.client.sendMessage(
          '554188996458@c.us',
          'Servidor inicializado com sucesso',
        );
        console.log('Mensagem de inicialização enviada com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar mensagem de inicialização:', error);
      }
    });

    this.client.initialize();
  }

  getStatus(): { isReady: boolean; qrCode: string } {
    return {
      isReady: this.isReady,
      qrCode: this.qrCode,
    };
  }

  getClient(): Client {
    return this.client;
  }
}
