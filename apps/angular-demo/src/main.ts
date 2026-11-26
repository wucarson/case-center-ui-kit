import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Demo } from './demo';
import { FormsDemo } from './forms';

// ?forms：表單整合測試頁；其餘是比對工具截圖用的展示頁
const page = new URLSearchParams(location.search).has('forms') ? FormsDemo : Demo;
bootstrapApplication(page, { providers: [provideZonelessChangeDetection()] }).catch((e) => console.error(e));
