import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHomePage(): string {
    const status = this.appService.getStatus();

    return `
      <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f0f2f5;
            }
            .container {
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              width: 100%;
              max-width: 500px;
            }
            #qrcode {
              margin: 20px 0;
            }
            .status {
              color: ${status.isReady ? 'green' : 'orange'};
              font-weight: bold;
            }
            .form-group {
              margin: 15px 0;
              text-align: left;
            }
            .form-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .form-group input, .form-group textarea {
              width: 100%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
              box-sizing: border-box;
            }
            button {
              background-color: #25d366;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover {
              background-color: #128c7e;
            }
            #resultado {
              margin-top: 15px;
              padding: 10px;
              border-radius: 4px;
            }
            .sucesso {
              background-color: #d4edda;
              color: #155724;
            }
            .erro {
              background-color: #f8d7da;
              color: #721c24;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>WhatsApp Web Status</h1>
            <p class="status">
              ${
                status.isReady
                  ? '✅ WhatsApp Web está conectado e pronto para uso!'
                  : '⏳ Aguardando conexão com WhatsApp...'
              }
            </p>
            ${
              !status.isReady && status.qrCode
                ? `
              <div>
                <p>Escaneie o QR Code abaixo com seu WhatsApp:</p>
                <div id="qrcode"></div>
              </div>
              <script>
                window.onload = function() {
                  new QRCode(document.getElementById("qrcode"), {
                    text: '${status.qrCode}',
                    width: 256,
                    height: 256,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                  });
                }
              </script>
            `
                : ''
            }
            ${
              status.isReady
                ? `
              <div id="formulario">
                <h2>Enviar Mensagem de Teste</h2>
                <div class="form-group">
                  <label for="contato">Número do WhatsApp:</label>
                  <input type="text" id="contato" placeholder="Ex: 554188996458" />
                </div>
                <div class="form-group">
                  <label for="mensagem">Mensagem:</label>
                  <textarea id="mensagem" rows="4" placeholder="Digite sua mensagem"></textarea>
                </div>
                <button onclick="enviarMensagem()">Enviar Mensagem</button>
                <div id="resultado"></div>
              </div>

              <div id="formulario-localizacao" style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                <h2>Enviar Localização de Teste</h2>
                <div class="form-group">
                  <label for="contato-loc">Número do WhatsApp:</label>
                  <input type="text" id="contato-loc" placeholder="Ex: 554188996458" />
                </div>
                <div class="form-group">
                  <label for="latitude">Latitude:</label>
                  <input type="number" step="any" id="latitude" placeholder="Ex: -25.4284" />
                </div>
                <div class="form-group">
                  <label for="longitude">Longitude:</label>
                  <input type="number" step="any" id="longitude" placeholder="Ex: -49.2733" />
                </div>
                <div class="form-group">
                  <label for="nome-entrega">Nome da Entrega:</label>
                  <input type="text" id="nome-entrega" placeholder="Ex: Entrega João da Silva" />
                </div>
                <button onclick="enviarLocalizacao()">Enviar Localização</button>
                <div id="resultado-loc"></div>
              </div>

              <script>
                const socket = io();

                function enviarMensagem() {
                  const contato = document.getElementById('contato').value;
                  const mensagem = document.getElementById('mensagem').value;
                  const resultado = document.getElementById('resultado');

                  if (!contato || !mensagem) {
                    resultado.className = 'erro';
                    resultado.textContent = 'Por favor, preencha todos os campos';
                    return;
                  }

                  socket.emit('Enviar Mensagem', { contato, mensagem }, (response) => {
                    if (response.mensagemEnviada) {
                      resultado.className = 'sucesso';
                      resultado.textContent = 'Mensagem enviada com sucesso!';
                      // Limpa os campos
                      document.getElementById('contato').value = '';
                      document.getElementById('mensagem').value = '';
                    } else {
                      resultado.className = 'erro';
                      resultado.textContent = 'Erro ao enviar mensagem';
                    }
                  });
                }

                function enviarLocalizacao() {
                  const contato = document.getElementById('contato-loc').value;
                  const latitude = parseFloat(document.getElementById('latitude').value);
                  const longitude = parseFloat(document.getElementById('longitude').value);
                  const nomeEntrega = document.getElementById('nome-entrega').value;
                  const resultado = document.getElementById('resultado-loc');

                  if (!contato || isNaN(latitude) || isNaN(longitude) || !nomeEntrega) {
                    resultado.className = 'erro';
                    resultado.textContent = 'Por favor, preencha todos os campos corretamente';
                    return;
                  }

                  socket.emit('Obter Localizacao', {
                    contato,
                    coordenadas: { latitude, longitude },
                    nomeEntrega
                  }, (response) => {
                    if (response.enviarLocalizacao) {
                      resultado.className = 'sucesso';
                      resultado.textContent = 'Localização enviada com sucesso!';
                      // Limpa os campos
                      document.getElementById('contato-loc').value = '';
                      document.getElementById('latitude').value = '';
                      document.getElementById('longitude').value = '';
                      document.getElementById('nome-entrega').value = '';
                    } else {
                      resultado.className = 'erro';
                      resultado.textContent = 'Erro ao enviar localização';
                    }
                  });
                }
              </script>
            `
                : ''
            }
          </div>
          ${
            !status.isReady
              ? `
            <script>
              setTimeout(() => window.location.reload(), 5000);
            </script>
          `
              : ''
          }
        </body>
      </html>
    `;
  }

  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }
}
