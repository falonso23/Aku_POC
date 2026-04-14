# 📦 Proyecto: Dispositivo Educativo de Deducción sin Pantallas

## 🧠 Descripción General

Este proyecto consiste en el desarrollo de un **dispositivo físico interactivo, sin pantallas**, diseñado para entornos educativos y familiares, que permite a los usuarios aprender a través de **juegos de deducción guiados por árboles de decisión**.

El sistema propone una experiencia similar a un juego tipo “adivinar”, pero con un enfoque pedagógico: no solo identifica un objeto, animal o concepto, sino que también **explica el razonamiento detrás de la deducción**, corrige errores del usuario y refuerza el aprendizaje mediante preguntas adicionales.

### 🎯 Objetivos principales

* Fomentar el pensamiento lógico y la clasificación conceptual
* Ofrecer una alternativa educativa sin pantallas
* Crear una experiencia social (uso en grupo)
* Permitir expansión de contenido mediante nuevos modos

---

## 🧩 Concepto del Producto

El dispositivo funciona como un **“game master educativo”** que guía a los usuarios a través de preguntas estructuradas.

### Flujo básico:

1. El usuario piensa en algo (ej: animal)
2. El dispositivo hace preguntas (sí/no)
3. Deduce la respuesta
4. Explica por qué llegó a esa conclusión
5. (Opcional) Refuerza con preguntas educativas

### Ejemplo:

* “¿Vive en el agua?”
* “¿Respira aire?”
  → “Es un delfín”

Explicación:

> “Es un mamífero porque respira aire y no tiene branquias.”

---

## 🧠 Enfoque Educativo

El valor educativo del sistema se basa en:

* **Aprendizaje por clasificación**
* **Explicaciones causales (no solo respuestas)**
* **Corrección de errores del usuario**
* **Refuerzo activo mediante preguntas**

### Tipos de explicación:

* Lógica: “Es un mamífero porque…”
* Comparativa: “A diferencia de los peces…”
* Contextual: “Aunque vive en el agua…”

---

## 🎮 Modos Iniciales

* 🐾 Animales (clasificación biológica)
* 🌍 Geografía (países, regiones)
* 🧪 Objetos (materiales y propiedades)

Todos los modos utilizan el mismo motor de decisión.

---

# 🚀 Roadmap de Desarrollo

---

## 🧪 Fase 1 — MVP (Validación)

### Objetivo:

Validar si la experiencia es atractiva y educativa.

### Características:

* Aplicación móvil simple (sin hardware)
* 1–2 modos (ej: animales)
* Árboles de decisión predefinidos
* Explicaciones con distintos enfoques
* Corrección de respuestas incorrectas
* Uso de micrófono y parlante del teléfono

### Métricas (guardadas localmente):

* Número de partidas
* Tasa de aciertos
* Puntos de fallo del árbol
* Duración de sesiones
* Uso de explicaciones

---

## 🔁 Fase 2 — Mejora del Producto (Software)

### Objetivo:

Refinar la experiencia antes de hardware.

### Características:

* Más modos (geografía, objetos)
* Mejores árboles de decisión
* Sistema de dificultad
* Modo “enseñar activamente” (preguntas post-juego)
* Mejor UX de voz/interacción

---

## 🧪 Fase 3 — Prototipo Físico

### Objetivo:

Validar la experiencia sin pantallas en contexto real.

### Características:

* Dispositivo simple (ej: Raspberry Pi)
* Micrófono + parlante
* Botón físico (interacción básica)
* Caja impresa en 3D (no final)
* Misma lógica del MVP

### Enfoque:

* No estética final
* Iteración rápida
* Test en aula / grupo

---

## 📦 Fase 4 — Producto Hardware

### Objetivo:

Construir un dispositivo listo para uso real.

### Características:

* Diseño físico cuidado (tipo juguete)
* Interacción optimizada (audio + botones)
* Sistema offline completo
* Experiencia robusta en grupo

---

## 🌐 Fase 5 — Plataforma Conectada

### Objetivo:

Expandir contenido y mejorar el sistema.

### Características:

* Conexión a internet
* Descarga de nuevos modos
* Actualización de árboles
* Corrección de contenido
* Sincronización de métricas

---

## 🖥️ Fase 6 — (Opcional) Pantalla

### Objetivo:

Mejorar la experiencia visual (sin ser central)

### Características:

* Pantalla simple
* Ilustraciones pre-generadas
* Apoyo visual al aprendizaje

---

# ⚙️ Arquitectura Técnica (Simplificada)

* Motor de decisión basado en árboles (JSON)
* Sistema de nodos con:

  * pregunta
  * respuestas
  * explicación asociada
* Módulo de voz (input/output)
* Almacenamiento local de datos
* Sistema de actualización (en fases avanzadas)

---

# 🔥 Diferenciales del Producto

* Sin pantallas (alineado con tendencias educativas)
* Explicaciones inteligentes (no solo respuestas)
* Aprendizaje activo
* Uso social (grupo/aula)
* Bajo costo operativo (sin IA en tiempo real)

---

# ⚠️ Riesgos y Consideraciones

* Calidad del contenido (clave del éxito)
* Diseño de árboles (complejidad conceptual)
* UX de voz en entornos ruidosos
* Iteración de hardware (costosa si se hace temprano)

---

# 🧠 Conclusión

El proyecto tiene potencial como:

* 🧸 Juguete educativo
* 🏫 Herramienta para aula
* 👨‍👩‍👧 Producto familiar

La estrategia recomendada es:

👉 validar primero el contenido y la experiencia
👉 luego evolucionar hacia hardware

El verdadero valor no está en la tecnología, sino en:

> **cómo se estructura y transmite el conocimiento**

---

## 🚀 Próximos pasos sugeridos

1. Diseñar un modo completo (ej: animales)
2. Implementar MVP funcional
3. Testear con usuarios reales
4. Iterar árboles y explicaciones
5. Construir primer prototipo físico

---
