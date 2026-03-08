import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true
});

// @ts-ignore
const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
  // 🛡️ SECURITY HEADERS & CORS CONFIGURATION
  turbopack: {},
  async headers() {
    return [
      {
        // Aplicar estos headers a TODAS las rutas de la aplicación
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            // Protección contra ataques de Clickjacking (Mete tu web en un iframe)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            // Bloquea el sniffing de tipos MIME
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Forzar conexiones HTTPS seguras y evitar downgrade
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            // Controlar qué tanta información de referencia se envía al navegar
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            // Políticas de Seguridad que protegen permisos del hardware (Cámara, Micro)
            key: 'Permissions-Policy',
            value: 'camera=self, microphone=self, geolocation=self'
          }
        ]
      },
      {
        // 🚧 REGLAS ESTRICTAS DE CORS PARA LAS APIs
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            // SOLO JAMALI OS PUEDE CONSULTAR ESTAS APIS. NADI MAS.
            // Para desarrollo, puede ser '*', pero en prod debes poner tu dominio, ej: 'https://app.jamalios.com'
            key: 'Access-Control-Allow-Origin',
            value: '*' // NOTA AL DUEÑO: Cambiaremos esto al dominio oficial antes de producción
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          }
        ]
      }
    ];
  },
};

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(withPWA(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: process.env.SENTRY_ORG || "jamali-os",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  automaticVercelMonitors: true,
});
