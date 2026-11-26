import { createApp } from 'vue';
import '@wucarson/facet-styles/components.css';
import '../../shared/case.css';
import Demo from './Demo.vue';
import Forms from './Forms.vue';

// ?forms：表單整合測試頁；其餘是比對工具截圖用的展示頁
createApp(new URLSearchParams(location.search).has('forms') ? Forms : Demo).mount('#app');
