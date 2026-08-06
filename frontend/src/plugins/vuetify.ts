/**
 * plugins/vuetify.ts
 *
 * Konfigurasi Vuetify dengan tema Napza Edu Card
 */

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'napzaLight',
    themes: {
      napzaLight: {
        dark: false,
        colors: {
          background: '#F5F7FA',
          surface: '#FFFFFF',
          'surface-variant': '#E8EDF3',
          primary: '#1565C0',
          'primary-darken-1': '#0D47A1',
          secondary: '#00897B',
          'secondary-darken-1': '#00695C',
          accent: '#FF6F00',
          error: '#D32F2F',
          warning: '#F9A825',
          info: '#0288D1',
          success: '#2E7D32',
          'on-background': '#1A1A2E',
          'on-surface': '#1A1A2E',
        },
      },
      napzaDark: {
        dark: true,
        colors: {
          background: '#0F1923',
          surface: '#1A2736',
          'surface-variant': '#243447',
          primary: '#42A5F5',
          'primary-darken-1': '#1E88E5',
          secondary: '#4DB6AC',
          'secondary-darken-1': '#26A69A',
          accent: '#FFB74D',
          error: '#EF5350',
          warning: '#FDD835',
          info: '#29B6F6',
          success: '#66BB6A',
          'on-background': '#E8EDF3',
          'on-surface': '#E8EDF3',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'xl',
      elevation: 2,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
  },
})
