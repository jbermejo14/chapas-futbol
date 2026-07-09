# Proyecto: Fútbol Chapas (Stadium Arena Edition)

Este documento describe la arquitectura, stack tecnológico y estado actual del proyecto "Fútbol Chapas", para servir de contexto general en futuras interacciones.

## Stack Tecnológico
- **Framework:** React Native con Expo (v57).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (`native` y `bottom-tabs`).
- **Estado Global:** Zustand (`store/chapasStore.ts`), para persistencia (partidas, experiencia, nivel, monedas, equipos desbloqueados, perfil) usa `AsyncStorage`.
- **Backend (BaaS):** Firebase (Autenticación anónima, Firestore para almacenar perfiles, niveles y sistema de Matchmaking).
- **Gráficos y Físicas:** SVG (`react-native-svg`) combinado con un renderizador propio (`ChapaModular`) para lograr estética 2.5D hiper-casual. Físicas gestionadas manualmente con vectores, masa y restitución en un `requestAnimationFrame`.
- **UI y Estilos:** Estilos puros de React Native (`StyleSheet`). Paleta vibrante, sombras duras, interfaces tipo cómic y botones 2.5D.

## Estructura de Carpetas (`src/`)
- `components/`: Componentes reutilizables de UI.
  - `CustomTabBar.tsx`: Barra de navegación inferior.
  - `MatchResultOverlay.tsx`: Pantalla de victoria/derrota con resumen de estadísticas y EXP ganada.
  - `ChapaModular.tsx`: Componente core para renderizar cualquier chapa de forma unificada (bordes, máscara circular, reflejos y banderas SVG).
- `navigation/`: Contiene `AppNavigator.tsx` con el stack principal.
- `screens/`:
  - `HomeScreen.tsx` (Pestaña "JUGAR"): Selección de Arenas.
  - `CustomizationScreen.tsx` ("MI CLUB"): Gestión de equipos adquiridos y formaciones.
  - `ShopScreen.tsx` ("PRO STORE"): Tienda in-game para desbloquear nuevas chapas con monedas.
  - `CoinShopScreen.tsx`: Tienda de microtransacciones (simuladas) para comprar monedas.
  - `GameScreen.tsx`: Motor de físicas, renderizado de la partida e interfaz in-game (marcador, nivel, botones de menú y mute).
  - `ProfileScreen.tsx`: Perfil del jugador, ajustes visuales, barra de progreso de EXP y Nivel.
  - `FriendsScreen.tsx`: Sistema de amigos (código de amigo y lista social).
- `data/`: `chapasData.ts` incluye las listas estáticas de todos los equipos (países y temáticos), formaciones y estadios.
- `services/`: Lógica de backend (ej. `matchmaking.ts`).

## Funcionalidades Actuales
- **Economía y Monetización:** 
  - Jugar una partida cuesta 50 monedas.
  - Funciones de Ads simuladas (botón de "+50 Monedas" viendo un anuncio).
  - Tienda de Chapas ("PRO STORE") donde las chapas cuestan 200 monedas.
- **Sistema de Progresión (Niveles):**
  - Los usuarios ganan EXP en los partidos: 50 por gol, 100 bono por victoria, 25 por completar.
  - Cada nivel requiere 500 EXP de forma progresiva. El nivel se muestra en el perfil y en el marcador de las partidas.
- **Modos de Juego:** 
  - **Online / Matchmaking:** Búsqueda en Firestore. Si tras 6 segundos no hay nadie, fallback a IA.
  - **1 VS 1 Local:** Jugar contra un amigo en el mismo dispositivo.
- **Motor Físico y Reglas:**
  - Sistema "pull-back" / "tirachinas".
  - El partido acaba automáticamente a los **2 goles**.
- **Catálogo Visual:**
  - Equipos basados en naciones y **múltiples chapas temáticas** (bola 8, calavera, radiactivo, baloncesto, etc.).

## Cómo expandir el proyecto
- **Para añadir imágenes:** Coloca las imágenes en `/assets` y modifica `src/data/chapasData.ts`.
- **Mejora de IA:** La IA actual hace tiro directo; se puede refactorizar para calcular bandas/rebotes.
- **Multijugador Real-Time:** Falta sincronizar las posiciones a través de Firebase/WebSockets durante el propio partido, ya que actualmente solo sincroniza la sala de espera.
