import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { PrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { Noir } from './app-theme';
import { ToastModule } from 'primeng/toast';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { provideMapboxGL } from 'ngx-mapbox-gl';
import localeEnGb from '@angular/common/locales/en-GB';
import { registerLocaleData } from '@angular/common';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ErrorInterceptor } from './interceptors/http-error.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { en } from 'primelocale/js/en.js';
import { ru } from 'primelocale/js/ru.js';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslateStore,
  TranslateModuleConfig
} from '@ngx-translate/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LocalizationService } from './services/localization.service';

registerLocaleData(localeEnGb);
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-GB' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    TranslateService,
    TranslateStore,
    LocalizationService,
    //     const translate = inject(TranslateService);
    //     const primeng   = inject(PrimeNG);

    //     // какие языки доступны
    //     translate.addLangs(['en','ru']);
    //     translate.setDefaultLang('ru');

    //     // читаем сохранённый или берём дефолт
    //     const stored = localStorage.getItem('language');
    //     const lang   = stored ? JSON.parse(stored).code : 'ru';
    //     translate.use(lang);

    //     // сразу задаем перевод PrimeNG из primelocale
    //     if (lang === 'ru') {
    //       primeng.setTranslation(ru);
    //     } else {
    //       primeng.setTranslation(en);
    //     }

    //     // при смене языка — обновляем перевод
    //     translate.onLangChange.subscribe(({ lang }) => {
    //       primeng.setTranslation(lang === 'ru' ? ru : en);
    //     });
    //   }),
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
          },
          darkModeSelector: '.p-dark'
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
    {
      provide: 'BASE_HREF',
      useFactory: () => {
        const baseElement = document.querySelector('base');
        return baseElement ? baseElement.getAttribute('href') || '/' : '/';
      }
    }
  ]
};
