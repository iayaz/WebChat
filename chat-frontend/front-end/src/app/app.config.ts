import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { WsService } from './service/websockets/ws.service';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
