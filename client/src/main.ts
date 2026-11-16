// PRESENTATION LAYER entry: Angular runs in the browser and talks to Express only via HTTP/JSON.
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
bootstrapApplication(AppComponent, appConfig).catch((e) => console.error(e));
