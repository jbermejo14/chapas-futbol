# Proyecto: Fútbol Chapas (Stadium Arena Edition)

Este documento describe la arquitectura, stack tecnológico y estado actual del proyecto "Fútbol Chapas", para servir de contexto general en futuras interacciones.

## Stack Tecnológico
- **Framework:** React Native con Expo (v57).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (`native` y `native-stack`).
- **Estado Global:** Zustand (`store/chapasStore.ts`), para persistencia (partidas ganadas, equipos desbloqueados) usa `AsyncStorage`.
- **Gráficos y Físicas:** SVG (`react-native-svg`) para líneas auxiliares. Las físicas de las chapas se manejan manualmente (sin librerías externas) usando cálculos de vectores, masa, restitución (rebote) y fricción en un ciclo de `requestAnimationFrame`.
- **UI y Estilos:** Estilos puros de React Native (`StyleSheet`), colores y componentes personalizados basados en un diseño "Stadium Arena" (colores neón vibrantes, fondos oscuros).

## Estructura de Carpetas (`src/`)
- `navigation/`: Contiene `AppNavigator.tsx` con el stack principal.
- `screens/`: Pantallas principales de la UI.
  - `HomeScreen.tsx`: Menú principal del juego.
  - `SetupScreen.tsx`: Pantalla de configuración previa al partido (elección de estadio, equipos, formaciones).
  - `GameScreen.tsx`: Motor del juego y renderizado de la partida (terreno de juego, chapas, marcadores, pantalla de victoria).
- `data/`: Datos estáticos y configuraciones.
  - `chapasData.ts`: Define equipos (`TEAMS`), formaciones (`FORMATIONS`) y estadios (`FIELDS`).
- `theme/`: Archivos de diseño global.
  - `colors.ts`: Paleta de colores del diseño Stadium Arena.
- `store/`: Manejo del estado global.
  - `chapasStore.ts`: Almacena métricas persistentes como victorias y equipos desbloqueados.

## Funcionalidades Actuales
- **Modos de Juego:** 1 Jugador (contra IA básica) o 2 Jugadores (local en el mismo dispositivo).
- **Personalización (Setup):** 
  - Posibilidad de elegir entre varios Estadios (fondo verde con franjas, estadio neón, etc.), con soporte para cargar imágenes personalizadas si se definen en la data.
  - Selección de Equipos (con soporte para cargar logotipos o banderas) y desbloqueo progresivo por victorias.
  - Selección de Formación táctica inicial para las chapas.
- **Motor Físico:**
  - Sistema de tiro ("pull-back" / "tirachinas") arrastrando el dedo para determinar dirección y potencia de disparo.
  - Colisiones realistas chapa-bola, chapa-chapa (rebotando y corrigiendo penetración de colisión).
  - Efectos de fricción simulando el césped.
- **Visuales (Stadium Arena):**
  - Marcador digital superior con tiempo "90' LIVE" en estilo neón.
  - Fichas circulares con dorsales centrales.
  - Pantalla final de victoria tras alcanzar los 3 goles: muestra animación de confeti en pantalla, logos de equipos, resultado final, y una tarjeta de estadísticas de partido calculada dinámicamente (Tiros a Puerta, Posesión y Faltas).

## Cómo expandir el proyecto
- **Para añadir imágenes:** Coloca las imágenes en la carpeta `/assets` (ej. `/assets/fields/camp_nou.png`, `/assets/teams/spain.png`) y modifica `src/data/chapasData.ts` añadiendo la propiedad `image: require('../../assets/tu_imagen.png')` al equipo o estadio correspondiente.
- **IA:** La IA actual tira la chapa más cercana a la bola en dirección directa. Se puede hacer más inteligente haciendo que calcule rebotes u obstáculos.
- **Físicas:** Se pueden incluir mecánicas más avanzadas como efectos (spin) rotando las piezas, o diferenciar el peso de las chapas para equipos distintos.
