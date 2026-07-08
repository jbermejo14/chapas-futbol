# Proyecto: Fútbol Chapas (Stadium Arena Edition)

Este documento describe la arquitectura, stack tecnológico y estado actual del proyecto "Fútbol Chapas", para servir de contexto general en futuras interacciones.

## Stack Tecnológico
- **Framework:** React Native con Expo (v57).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (`native` y `bottom-tabs`).
- **Estado Global:** Zustand (`store/chapasStore.ts`), para persistencia (partidas ganadas, equipos desbloqueados, monedas, perfil) usa `AsyncStorage`.
- **Backend (BaaS):** Firebase (Autenticación anónima, Firestore para almacenar perfiles de usuario y sistema de Matchmaking en tiempo real).
- **Gráficos y Físicas:** SVG (`react-native-svg`) para líneas auxiliares. Las físicas de las chapas se manejan manualmente usando cálculos de vectores, masa, restitución (rebote) y fricción en un ciclo de `requestAnimationFrame`.
- **UI y Estilos:** Estilos puros de React Native (`StyleSheet`), colores y componentes personalizados basados en un diseño "Stadium Arena" e hiper-casual.

## Estructura de Carpetas (`src/`)
- `components/`: Componentes reutilizables de UI.
  - `CustomTabBar.tsx`: Barra de navegación inferior personalizada.
  - `HypercasualButton.tsx`: Botones con estilo 2.5D animado.
  - `SoccerFieldBackground.tsx`: Componente de fondo animado para menús.
  - `ComicPanel.tsx`: Paneles tipo cómic para mostrar información y estadísticas.
  - `ChapaModular.tsx`: Componente para renderizar chapas y avatares.
- `navigation/`: Contiene `AppNavigator.tsx` con el stack principal y el menú inferior de pestañas (Tabs).
- `screens/`: Pantallas principales de la UI.
  - `CustomSplashScreen.tsx`: Pantalla de carga inicial al abrir el juego.
  - `HomeScreen.tsx` (Pestaña "JUGAR"): Pantalla principal que muestra la lista de Arenas/Estadios disponibles para jugar online o contra IA.
  - `SetupScreen.tsx`: Pantalla de configuración previa al partido local (elección de estadio, equipos, formaciones).
  - `GameScreen.tsx`: Motor del juego y renderizado de la partida.
  - `ProfileScreen.tsx`: Perfil del jugador y ajustes, incluye sistema de paneles tipo cómic.
  - `FriendsScreen.tsx`: Sistema de amigos (código de amigo, lista de amigos y panel de invitaciones).
- `data/`: Datos estáticos y configuraciones.
  - `chapasData.ts`: Define equipos (`TEAMS`), formaciones (`FORMATIONS`) y estadios (`FIELDS/ARENAS`).
- `services/`: Lógica de comunicación con el backend.
  - `matchmaking.ts`: Lógica para buscar partidas disponibles (`waiting`) en un campo específico o crear una nueva si no hay rival en 6 segundos (fallback a IA).
- `config/`: Configuración de servicios externos.
  - `firebaseConfig.ts`: Inicialización de Firebase.
- `store/`: Manejo del estado global.
  - `chapasStore.ts`: Almacena métricas y perfil, sincronizando datos localmente y en Firestore.

## Funcionalidades Actuales
- **Sistema de Economía (Monedas):** Jugar una partida cuesta 50 monedas. Ganar una partida recompensa con 100 monedas (el doble). Las monedas sirven para desbloquear nuevas Arenas.
- **Modos de Juego:** 
  - **Online / Matchmaking:** Al seleccionar una Arena, el sistema busca un oponente real para ese mismo estadio. Si tras 6 segundos no hay nadie, te empareja contra la IA (Francia).
  - **1 VS 1 Local:** Permite jugar contra un amigo en el mismo dispositivo físico.
- **Personalización y Perfil:** 
  - Los jugadores inician sesión de forma transparente (anónima) en Firebase.
  - Tienen un ID único y pueden editar su nombre público.
  - Interfaz de ajustes (con *sliders* visuales placeholders para Sonido y Música).
- **Motor Físico y Reglas:**
  - Sistema de tiro ("pull-back" / "tirachinas") arrastrando el dedo para determinar dirección y potencia de disparo.
  - **Condición de Victoria:** La partida finaliza automáticamente cuando un jugador anota **2 goles**.
  - Colisiones realistas chapa-bola, chapa-chapa (rebotando y corrigiendo penetración de colisión).
  - Efectos de fricción simulando el césped.
- **Visuales:**
  - Marcador digital superior estilo neón.
  - Pantalla final de victoria mostrando el resultado y otorgando las monedas correspondientes.

## Cómo expandir el proyecto
- **Estética Visual:** Se ha definido un prompt maestro para generar assets (menús con fondos desenfocados, botones hipercasual gruesos 2.5D, y chapas con texturas plásticas/metálicas top-down). Estos assets se irán incorporando progresivamente.
- **Para añadir imágenes:** Coloca las imágenes en la carpeta `/assets` y modifica `src/data/chapasData.ts` añadiendo la propiedad `image: require('../../assets/tu_imagen.png')`.
- **IA:** La IA actual tira la chapa más cercana a la bola de forma directa. Se puede mejorar calculando rebotes.
- **Multijugador Real-Time:** El matchmaking ya conecta a dos jugadores en una sala (Firestore doc), pero falta implementar la sincronización de las posiciones y disparos a través de Firebase/WebSockets durante el propio partido.
