import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { Noir } from './app-theme';
import { ToastModule } from 'primeng/toast';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { provideMapboxGL } from 'ngx-mapbox-gl';
import localeEnGb from '@angular/common/locales/en-GB';
import { registerLocaleData } from '@angular/common';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ErrorInterceptor } from './interceptors/http-error.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
registerLocaleData(localeEnGb);
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-GB' },
     {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,  
      multi: true, 
    },
    importProvidersFrom(BrowserModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    providePrimeNG({
      ripple: true,   
      theme: {
        preset: Noir,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng'
          }
        }
      }
    }),
    provideMapboxGL({
      accessToken: 'pk.eyJ1Ijoibm92YWthbmQiLCJhIjoiY2p3OXFlYnYwMDF3eTQxcW5qenZ2eGNoNCJ9.PTZDfrwxfMd-hAwzZjwPTg'
    }),
    
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(BrowserAnimationsModule, ToastModule),
    // importProvidersFrom(MessageService, ToastModule),
    {
      provide: 'BASE_HREF',
      useFactory: () => {
        // Определяем базовый путь автоматически
        const baseElement = document.querySelector('base');
        return baseElement ? baseElement.getAttribute('href') || '/' : '/';
      }
    }
  ]
};
