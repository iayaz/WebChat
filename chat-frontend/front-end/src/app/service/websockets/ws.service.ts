import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private ws!: WebSocket;

  constructor() {
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.ws = new WebSocket('ws://localhost:8080/', 'echo-protocol');

    this.ws.onerror = (error) => {
      console.log('Connection Error: ', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket Connection Closed');
    };

    this.ws.onmessage = (message) => {
      console.log('Received: ', message.data);
    };
    this.ws.onopen = () => {
      console.log('WebSocket Client Connected');
    };
  }
  sendUTF(message: any) {
    // this.ws.onopen = () => {
    //   console.log('WebSocket Client Connected');
    //   // this.sendMessage(message);
    // };
    if (this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage(message);
    } else {
      console.log('WebSocket connection not open.');
    }
  }

  private sendMessage(message: any) {
    console.log(message);
    this.ws.send(JSON.stringify(message));
  }

  closeConnection() {
    this.ws.close();
  }
}
