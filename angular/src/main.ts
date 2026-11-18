import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Demo } from './demo';

bootstrapApplication(Demo, { providers: [provideZonelessChangeDetection()] }).catch((e) => console.error(e));
