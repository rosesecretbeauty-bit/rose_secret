# 🌹 GUÍA COMPLETA DE PUBLICACIÓN GRATUITA - ROSE SECRET

> **Guía paso a paso para publicar tu proyecto full stack Rose Secret de forma 100% gratuita, sin comprar dominios ni servicios de pago.**

---

## 📋 ÍNDICE

1. [Elección de Plataformas Gratuitas](#1-elección-de-plataformas-gratuitas)
2. [Registro en Cada Plataforma](#2-registro-en-cada-plataforma)
3. [Configurar Base de Datos PostgreSQL Gratuita](#3-configurar-base-de-datos-postgresql-gratuita)
4. [Migrar Datos de MySQL a PostgreSQL](#4-migrar-datos-de-mysql-a-postgresql)
5. [Instalar Git (si no lo tienes)](#5-instalar-git-si-no-lo-tienes)
6. [Publicar el Backend (Node.js)](#6-publicar-el-backend-nodejs)
7. [Publicar el Frontend (React)](#7-publicar-el-frontend-react)
8. [Conectar Frontend con Backend](#8-conectar-frontend-con-backend)
9. [Configurar Variables de Entorno](#9-configurar-variables-de-entorno)
10. [Validación Final (Checklist)](#10-validación-final-checklist)
11. [Troubleshooting Común](#11-troubleshooting-común)

---

## 1. ELECCIÓN DE PLATAFORMAS GRATUITAS

### 🎯 **¿Qué plataforma usar para cada parte?**

#### **Backend (Node.js + Express)**
**✅ Opción Recomendada: Render.com**

- **Por qué Render:**
  - Plan gratuito generoso (750 horas/mes)
  - Deployment automático desde GitHub
  - Variables de entorno fáciles de configurar
  - SSL/HTTPS incluido (gratis)
  - Logs en tiempo real
  - Servicios que no se usan se "duermen" (pero se despiertan automáticamente)

- **Limitaciones del plan gratuito:**
  - El servicio se "duerme" después de 15 minutos de inactividad
  - La primera carga después de dormir puede tardar 30-60 segundos
  - 750 horas/mes (suficiente para 24/7 un solo servicio)
  - 512 MB RAM
  - 0.1 CPU compartida

- **URL que obtendrás:**
  - `https://rosesecret-backend.onrender.com` (o el nombre que elijas)

#### **Frontend (React + Vite)**
**✅ Opción Recomendada: Vercel**

- **Por qué Vercel:**
  - Optimizado para React/Vite
  - Deployment instantáneo desde GitHub
  - CDN global (muy rápido)
  - SSL/HTTPS automático
  - Variables de entorno fáciles
  - Sin límites en el plan gratuito para proyectos personales

- **Limitaciones del plan gratuito:**
  - 100 GB de ancho de banda/mes (más que suficiente)
  - Para proyectos personales (no comerciales grandes)
  - Deployments ilimitados

- **URL que obtendrás:**
  - `https://rosesecret.vercel.app` (o el nombre que elijas)

#### **Base de Datos (PostgreSQL)**
**✅ Opción Recomendada: Neon.tech**

- **Por qué Neon:**
  - PostgreSQL serverless (gratis)
  - 3 GB de almacenamiento (gratis)
  - Base de datos siempre activa (no se duerme)
  - Compatible con Prisma, Sequelize, etc.
  - Backup automático
  - Console web fácil de usar

- **Limitaciones del plan gratuito:**
  - 3 GB de almacenamiento
  - 256 MB RAM
  - Base de datos se pausa después de 7 días de inactividad (se reactiva automáticamente)

- **URL que obtendrás:**
  - `postgresql://user:password@host.neon.tech/database` (DATABASE_URL completa)

---

## 2. REGISTRO EN CADA PLATAFORMA

### 🔵 **2.1 Registro en Render.com (Backend)**

#### **Paso 1: Acceder a Render**
1. Abre tu navegador
2. Ve a: **https://render.com**
3. Haz clic en el botón **"Get Started for Free"** (arriba a la derecha)

#### **Paso 2: Crear cuenta**
1. Tienes 3 opciones para registrarte:
   - **Opción A (Recomendada):** Haz clic en **"Sign up with GitHub"**
     - Te pedirá autorizar a Render en GitHub
     - Haz clic en **"Authorize render"**
   - **Opción B:** Con email
     - Ingresa tu email
     - Crea una contraseña
     - Confirma tu email
   - **Opción C:** Con Google
     - Haz clic en **"Continue with Google"**
     - Selecciona tu cuenta de Google

#### **Paso 3: Verificar email (si usaste email)**
1. Revisa tu bandeja de entrada
2. Busca el email de Render
3. Haz clic en el enlace de verificación
4. Serás redirigido a Render

#### **Paso 4: Confirmar plan gratuito**
1. Render puede preguntarte qué plan quieres
2. **SELECCIONA: "Free"** o **"Individual"** (gratis)
3. **NO selecciones ningún plan de pago**
4. Completa el formulario (nombre, país) - es solo informativo
5. Haz clic en **"Continue"**

✅ **Ya estás registrado en Render. El dashboard debería aparecer.**

---

### 🟢 **2.2 Registro en Vercel.com (Frontend)**

#### **Paso 1: Acceder a Vercel**
1. Abre tu navegador
2. Ve a: **https://vercel.com**
3. Haz clic en el botón **"Sign Up"** (arriba a la derecha)

#### **Paso 2: Crear cuenta**
1. Tienes varias opciones:
   - **Opción A (Recomendada):** **"Continue with GitHub"**
     - Autoriza a Vercel en GitHub
     - Haz clic en **"Authorize Vercel"**
   - **Opción B:** Con email
     - Ingresa tu email y contraseña
   - **Opción C:** Con GitLab o Bitbucket

#### **Paso 3: Confirmar plan gratuito**
1. Vercel automáticamente te asigna el plan **Hobby** (gratis)
2. **NO necesitas seleccionar nada**, ya es gratis
3. El dashboard de Vercel aparecerá automáticamente

✅ **Ya estás registrado en Vercel.**

---

### 🟣 **2.3 Registro en Neon.tech (Base de Datos)**

#### **Paso 1: Acceder a Neon**
1. Abre tu navegador
2. Ve a: **https://neon.tech**
3. Haz clic en el botón **"Sign Up"** (arriba a la derecha)

#### **Paso 2: Crear cuenta**
1. Tienes opciones:
   - **Opción A (Recomendada):** **"Continue with GitHub"**
     - Autoriza a Neon en GitHub
   - **Opción B:** Con email
     - Ingresa tu email
     - Crea una contraseña
     - Confirma tu email

#### **Paso 3: Crear tu primera base de datos**
1. Después del registro, Neon te pedirá crear un proyecto
2. **Nombre del proyecto:** Escribe `rose-secret` (o el nombre que quieras)
3. **Región:** Selecciona la más cercana a ti (ej: `US East (Ohio)`)
4. **PostgreSQL Version:** Deja la versión por defecto (14 o 15)
5. Haz clic en **"Create Project"**

#### **Paso 4: Obtener DATABASE_URL**
1. Espera 1-2 minutos mientras se crea la base de datos
2. Cuando esté lista, verás una pantalla con tu **Connection String**
3. **IMPORTANTE:** Copia la URL que empieza con `postgresql://...`
   - Se verá algo como: `postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Guarda esta URL en un archivo de texto** (la necesitarás más adelante)
5. También puedes hacer clic en **"Show Password"** para ver la contraseña completa

✅ **Ya tienes tu base de datos PostgreSQL gratuita creada.**

---

## 3. CONFIGURAR BASE DE DATOS POSTGRESQL GRATUITA

### 📊 **3.1 Acceder a Neon Dashboard**

1. Ve a: **https://console.neon.tech**
2. Inicia sesión con tu cuenta
3. Verás tu proyecto `rose-secret` (o el nombre que elegiste)

### 🔑 **3.2 Obtener credenciales de conexión**

1. En el dashboard de Neon, haz clic en tu proyecto
2. En el menú lateral, haz clic en **"Connection Details"**
3. Verás varias formas de conectar:
   - **Connection string:** Es la URL completa `postgresql://...`
   - **Separated fields:** Host, User, Password, Database, Port

**Copia estos datos (los necesitarás):**
- **Host:** Algo como `ep-xxx-xxx.us-east-2.aws.neon.tech`
- **Database:** Generalmente `neondb` o `main`
- **User:** Algo como `neondb_owner`
- **Password:** (haz clic en "Show" para verla)
- **Port:** `5432` (estándar de PostgreSQL)

### 💾 **3.3 Probar la conexión (Opcional pero recomendado)**

Puedes probar que la conexión funciona usando un cliente SQL o desde tu código:

**Opción A: Desde tu backend local (temporalmente)**

1. Edita tu archivo `backend/.env` (si lo tienes)
2. Agrega temporalmente:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
   (Reemplaza con tu URL real de Neon)

3. Ejecuta en tu terminal:
   ```bash
   cd backend
   node scripts/test-db-connection.js
   ```

Si todo está bien, verás: `✅ Conexión exitosa a PostgreSQL`

---

## 4. MIGRAR DATOS DE MYSQL A POSTGRESQL

### 📦 **4.1 Preparar la estructura de la base de datos**

Tu proyecto ya tiene un archivo `backend/database/schema.sql` con la estructura MySQL. Necesitas adaptarlo a PostgreSQL.

#### **Diferencias principales MySQL vs PostgreSQL:**
1. **AUTO_INCREMENT** → `SERIAL` o `GENERATED ALWAYS AS IDENTITY`
2. **DATETIME** → `TIMESTAMP`
3. **TEXT sin límite** → `TEXT` (igual)
4. **ENGINE=InnoDB** → No se usa en PostgreSQL
5. **CHARSET utf8mb4** → `ENCODING 'UTF8'`

#### **Opción A: Crear script de migración automática**

1. En tu terminal, ve a la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Instala una herramienta de migración (opcional pero recomendado):
   ```bash
   npm install --save-dev pg-migrate
   ```

#### **Opción B: Migrar manualmente (Más seguro para empezar)**

1. **Accede a la consola SQL de Neon:**
   - Ve a: https://console.neon.tech
   - Haz clic en tu proyecto
   - Haz clic en **"SQL Editor"** (en el menú lateral)
   - Se abrirá un editor SQL web

2. **Ejecuta el schema adaptado:**
   - Abre tu archivo `backend/database/schema.sql`
   - Copia todo el contenido
   - Pega en el SQL Editor de Neon
   - **IMPORTANTE:** Antes de ejecutar, necesitas hacer estos cambios manuales:
     - Reemplaza `AUTO_INCREMENT` por `SERIAL`
     - Reemplaza `ENGINE=InnoDB` por nada (elimínalo)
     - Reemplaza `CHARSET=utf8mb4` por nada
     - Cambia `DATETIME` a `TIMESTAMP`

3. **Ejecuta el script:**
   - Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)
   - Espera a que termine
   - Si hay errores, léelos y corrígelos uno por uno

4. **Verifica que se crearon las tablas:**
   - En el SQL Editor, ejecuta:
     ```sql
     SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public';
     ```
   - Deberías ver todas tus tablas listadas

### 📥 **4.2 Migrar datos existentes (si tienes datos en MySQL local)**

Si tienes datos en tu MySQL local que quieres migrar:

#### **Opción A: Exportar desde MySQL y adaptar a PostgreSQL**

1. **Exportar desde MySQL:**
   ```bash
   mysqldump -u root -p rose_secret > data_export.sql
   ```

2. **Adaptar el archivo:**
   - Abre `data_export.sql`
   - Reemplaza sintaxis MySQL por PostgreSQL
   - O usa una herramienta online de conversión

#### **Opción B: Migrar manualmente (si son pocos datos)**

Si solo tienes datos de prueba o pocos registros:
1. Puedes insertarlos manualmente desde el SQL Editor de Neon
2. O simplemente empezar desde cero (recomendado si es desarrollo)

---

## 5. INSTALAR GIT (SI NO LO TIENES)

### ⚠️ **Verificar si Git está instalado**

Antes de subir tu código a GitHub, necesitas tener Git instalado. Para verificar si ya lo tienes:

1. Abre PowerShell o CMD
2. Escribe:
   ```bash
   git --version
   ```
3. **Si ves un número de versión** (ej: `git version 2.42.0`):
   - ✅ **Git ya está instalado** - Continúa a la sección 5.1
4. **Si ves el error `"git" no se reconoce como un comando`**:
   - ❌ **Git NO está instalado** - Sigue los pasos abajo

---

### 📥 **Instalar Git en Windows**

#### **Paso 1: Descargar Git**

1. Abre tu navegador
2. Ve a: **https://git-scm.com/download/win**
3. El sitio detectará automáticamente que usas Windows
4. La descarga comenzará automáticamente
5. Espera a que termine (el archivo se llama algo como `Git-2.42.0-64-bit.exe`)

#### **Paso 2: Instalar Git**

1. **Abre el archivo descargado:**
   - Ve a tu carpeta de Descargas
   - Haz doble clic en `Git-2.42.0-64-bit.exe` (o el nombre que tenga)

2. **Configuración de instalación:**
   - Si aparece "Control de cuentas de usuario", haz clic en **"Sí"**
   - Verás la pantalla de instalación de Git

3. **Configuraciones importantes:**
   - **"Select Components":** Deja todo marcado por defecto (✅)
   - **"Choosing the default editor":** Puedes dejar **"Nano editor"** o elegir **"Visual Studio Code"** si lo tienes instalado
   - **"Adjusting your PATH environment":** 
     - **IMPORTANTE:** Selecciona **"Git from the command line and also from 3rd-party software"** (recomendado)
   - **"Choosing HTTPS transport backend":** Deja **"Use the OpenSSL library"** (por defecto)
   - **"Configuring the line ending conversions":** Deja **"Checkout Windows-style, commit Unix-style line endings"** (por defecto)
   - **"Configuring the terminal emulator":** Deja **"Use MinTTY"** (por defecto)
   - **"Configuring extra options":** 
     - Deja marcado **"Enable file system caching"**
     - Deja marcado **"Enable Git Credential Manager"**
   - Haz clic en **"Install"**

4. **Espera la instalación:**
   - La instalación tomará 1-2 minutos
   - Verás una barra de progreso
   - Cuando termine, verás "Completed"

5. **Finalizar:**
   - Haz clic en **"Finish"**
   - Git está instalado ✅

#### **Paso 3: Verificar la instalación**

1. **Cierra y vuelve a abrir PowerShell/CMD:**
   - ⚠️ **IMPORTANTE:** Debes cerrar y abrir una nueva ventana para que los cambios surtan efecto

2. **Prueba Git:**
   ```bash
   git --version
   ```

3. **Si ves algo como `git version 2.42.0` (o cualquier versión):**
   - ✅ **¡Git está instalado correctamente!**
   - Puedes continuar con la siguiente sección

4. **Si aún ves el error:**
   - Cierra TODAS las ventanas de PowerShell/CMD
   - Reinicia tu computadora (a veces es necesario)
   - Vuelve a probar

#### **Paso 4: Configurar Git (Primera vez)**

Después de instalar Git, necesitas configurarlo con tu nombre y email:

1. Abre PowerShell o CMD
2. Ejecuta estos comandos (reemplaza con tu información):

   ```bash
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu-email@ejemplo.com"
   ```

   **Ejemplo:**
   ```bash
   git config --global user.name "Juan Pérez"
   git config --global user.email "juan.perez@gmail.com"
   ```

3. **Verifica la configuración:**
   ```bash
   git config --global user.name
   git config --global user.email
   ```
   
   Deberías ver tu nombre y email.

✅ **Git está listo para usar.**

---

## 6. PUBLICAR EL BACKEND (NODE.JS)

### 🚀 **6.1 Preparar el proyecto en GitHub**

**IMPORTANTE:** Render se conecta desde GitHub. Si tu proyecto no está en GitHub, debes subirlo primero.

#### **Si tu proyecto YA está en GitHub:**
- ✅ Continúa al siguiente paso (6.2)

#### **Si tu proyecto NO está en GitHub:**

1. **Crea una cuenta en GitHub (si no tienes):**
   - Ve a: https://github.com/signup
   - Completa el formulario
   - Verifica tu email

2. **Crea un nuevo repositorio:**
   - Inicia sesión en GitHub
   - Haz clic en el botón **"+"** (arriba a la derecha)
   - Selecciona **"New repository"**
   - **Repository name:** `rose-secret` (o el nombre que quieras)
   - **Description:** (Opcional) "Rose Secret E-commerce Platform"
   - **Visibility:**
     - ✅ **Public** (gratis, cualquiera puede ver el código)
     - O ✅ **Private** (solo tú puedes verlo, pero los servicios gratuitos pueden conectarse igual)
   - **NO marques** "Add a README file" (ya tienes uno)
   - **NO marques** "Add .gitignore" (a menos que no tengas uno)
   - Haz clic en **"Create repository"**

3. **Copia la URL de tu repositorio:**
   - GitHub te mostrará una página con instrucciones
   - Verás una URL como: `https://github.com/tu-usuario/rose-secret.git`
   - **Copia esta URL** (la necesitarás en el siguiente paso)

4. **Sube tu código desde tu computadora:**
   
   Abre PowerShell o CMD y ejecuta estos comandos **UNO POR UNO**:

   ```bash
   cd C:\xampp\htdocs\RoseSecret
   ```
   
   ```bash
   git init
   ```
   (Inicializa Git en tu carpeta)

   ```bash
   git add .
   ```
   (Agrega todos los archivos)

   ```bash
   git commit -m "Initial commit"
   ```
   (Guarda los cambios)

   ```bash
   git branch -M main
   ```
   (Renombra la rama a "main")

   ```bash
   git remote add origin https://github.com/tu-usuario/rose-secret.git
   ```
   ⚠️ **IMPORTANTE:** 
   - **NO copies este comando tal cual** - es solo un ejemplo
   - **Reemplaza `tu-usuario`** con tu nombre de usuario real de GitHub
   - **Reemplaza `rose-secret`** con el nombre real de tu repositorio
   - **Ejemplo real:** Si tu usuario es `rosesecretbeauty-bit` y tu repo es `rose_secret`, el comando sería:
     ```bash
     git remote add origin https://github.com/rosesecretbeauty-bit/rose_secret.git
     ```

   **Si ya ejecutaste el comando con el placeholder por error:**
   
   Primero verifica qué remote tienes configurado:
   ```bash
   git remote -v
   ```
   
   Si ves `tu-usuario` o `rose-secret` (placeholders), necesitas cambiarlo:
   
   **Opción A: Eliminar y agregar de nuevo:**
   ```bash
   git remote remove origin
   git remote add origin https://github.com/TU-USUARIO-REAL/TU-REPO-REAL.git
   ```
   (Reemplaza con tus datos reales)
   
   **Opción B: Cambiar la URL directamente:**
   ```bash
   git remote set-url origin https://github.com/TU-USUARIO-REAL/TU-REPO-REAL.git
   ```
   (Reemplaza con tus datos reales)
   
   **Verifica que quedó correcto:**
   ```bash
   git remote -v
   ```
   Deberías ver tu URL real de GitHub (ej: `https://github.com/rosesecretbeauty-bit/rose_secret.git`)

   ```bash
   git push -u origin main
   ```
   (Sube tu código a GitHub)

5. **Si Git te pide autenticación:**
   - Puede pedirte usuario y contraseña de GitHub
   - **Usuario:** Tu nombre de usuario de GitHub
   - **Contraseña:** Ya NO puedes usar tu contraseña normal
   - Debes crear un **Personal Access Token**:
     - Ve a: https://github.com/settings/tokens
     - Haz clic en **"Generate new token"** → **"Generate new token (classic)"**
     - **Note:** "Para Rose Secret"
     - **Expiration:** 90 days (o el que prefieras)
     - Marca: ✅ **repo** (todos los sub-ítems)
     - Haz clic en **"Generate token"**
     - **COPIA EL TOKEN** (solo se muestra una vez, guárdalo bien)
     - Cuando Git pida contraseña, pega el token (NO tu contraseña)

6. **Verifica que se subió:**
   - Ve a tu repositorio en GitHub: `https://github.com/tu-usuario/rose-secret`
   - Deberías ver todos tus archivos

✅ **Tu código está en GitHub.**

### 🔧 **6.2 Crear Web Service en Render**

1. Ve a: https://dashboard.render.com
2. Haz clic en el botón **"New +"** (arriba a la derecha)
3. Selecciona **"Web Service"**

4. **Conectar repositorio:**
   - Si no has conectado GitHub antes:
     - Haz clic en **"Connect GitHub"**
     - Autoriza a Render en GitHub
     - Selecciona tu repositorio `rose-secret`
   - Si ya conectaste GitHub:
     - Busca y selecciona tu repositorio `rose-secret`

5. **Configurar el servicio:**
   - **Name:** `rosesecret-backend` (o el nombre que quieras)
   - **Region:** Selecciona la más cercana (ej: `Oregon (US West)`)
   - **Branch:** `main` (o la rama que uses)
   - **Root Directory:** `backend` (¡IMPORTANTE! Render debe saber que el backend está en la carpeta `backend`)
   - **Runtime:** `Node`
   - **Build Command:** `npm install` (Render lo detecta automáticamente)
   - **Start Command:** `npm start` (Render lo detecta automáticamente)
   - **Plan:** **SELECCIONA "Free"** (no selecciones ningún plan de pago)

6. **Variables de Entorno (por ahora déjalas vacías, las configuramos después):**
   - Por ahora, haz clic en **"Advanced"** y luego en **"Create Web Service"**

### 🔐 **6.3 Configurar Variables de Entorno en Render**

Después de crear el servicio, verás el dashboard. Ahora configura las variables:

1. En el dashboard de tu servicio, haz clic en **"Environment"** (en el menú lateral)

2. Haz clic en **"Add Environment Variable"** y agrega cada una de estas:

#### **Variables OBLIGATORIAS:**

```
NODE_ENV = production
```

```
PORT = 10000
```
*(Render asigna el puerto automáticamente, pero esta variable asegura compatibilidad)*

```
DATABASE_URL = postgresql://user:password@host:port/database
```
*(Pega aquí la URL completa de Neon que copiaste antes)*

```
JWT_SECRET = 2wobCIQHdxpMNrutVf/hxwEjPmF0d++EYscsO2a6uRA=
```
*(Usa el mismo que tienes en tu env.example.txt, o genera uno nuevo con: `openssl rand -base64 32`)*

```
FRONTEND_URL = https://tu-frontend.vercel.app
```
*(Por ahora escribe un placeholder, lo actualizaremos después de publicar el frontend)*

```
ALLOWED_ORIGINS = https://tu-frontend.vercel.app
```
*(Igual, placeholder por ahora)*

#### **Variables de CLOUDINARY (Obligatorias si usas imágenes):**

```
CLOUDINARY_URL = cloudinary://tu_api_key:tu_api_secret@tu_cloud_name
```
*(Reemplaza con tu Cloudinary URL real de https://cloudinary.com/console)*

#### **Variables de STRIPE (Obligatorias si usas pagos):**

```
STRIPE_SECRET_KEY = sk_live_TU_STRIPE_SECRET_KEY_AQUI
```
*(Reemplaza con tu Stripe Secret Key real de https://dashboard.stripe.com/apikeys)*

```
STRIPE_PUBLISHABLE_KEY = pk_live_TU_STRIPE_PUBLISHABLE_KEY_AQUI
```
*(Reemplaza con tu Stripe Publishable Key real)*

#### **Variables de TWILIO (Obligatorias si usas SMS):**

```
SMS_PROVIDER = twilio
```

```
TWILIO_ACCOUNT_SID = AC_TU_TWILIO_ACCOUNT_SID_AQUI
```
*(Reemplaza con tu Twilio Account SID real de https://console.twilio.com/)*

```
TWILIO_AUTH_TOKEN = tu_twilio_auth_token_aqui
```
*(Reemplaza con tu Twilio Auth Token real)*

```
TWILIO_VERIFY_SERVICE_SID = VA_tu_twilio_verify_service_sid_aqui
```
*(Reemplaza con tu Twilio Verify Service SID real)*

#### **Variables de EMAIL (Elige una opción):**

**Opción A: Gmail (Recomendado para empezar):**

```
EMAIL_PROVIDER = gmail
```

```
GMAIL_USER = rose.secret.beauty@gmail.com
```

```
GMAIL_APP_PASSWORD = rvfp mfdc wodn tryi
```

```
EMAIL_FROM_ADDRESS = rose.secret.beauty@gmail.com
```

```
EMAIL_FROM_NAME = Rose Secret
```

**Opción B: Resend:**

```
EMAIL_PROVIDER = resend
```

```
RESEND_API_KEY = re_jYfLTLJ6_EgYggy29RbED39E2JVrHXBsq
```

#### **Variables OPCIONALES (Puedes usar los valores por defecto o ajustarlos):**

```
JWT_EXPIRES_IN = 7d
```

```
RATE_LIMIT_ENABLED = true
```

```
CACHE_ENABLED = true
```

```
LOG_FORMAT = json
```

```
DEBUG = false
```

3. **Guarda las variables:**
   - Cada vez que agregues una variable, haz clic en **"Save Changes"**
   - Render automáticamente reiniciará el servicio

### 🚦 **6.4 Verificar que el Backend funciona**

1. **Espera el deployment:**
   - Render mostrará los logs en tiempo real
   - Busca el mensaje: `✅ Servidor corriendo en http://0.0.0.0:10000`
   - Si ves errores, léelos y corrígelos

2. **Obtén la URL de tu backend:**
   - En el dashboard de Render, arriba verás: **"Your service is live at:"**
   - La URL será algo como: `https://rosesecret-backend.onrender.com`
   - **Copia esta URL** (la necesitarás para el frontend)

3. **Probar el health check:**
   - Abre tu navegador
   - Ve a: `https://tu-backend-url.onrender.com/api/health`
   - Deberías ver:
     ```json
     {
       "success": true,
       "message": "Backend funcionando correctamente",
       "timestamp": "..."
     }
     ```

4. **Si hay errores comunes:**
   - **Error de conexión a BD:** Verifica que `DATABASE_URL` esté correcta
   - **Error de JWT_SECRET:** Verifica que esté definido
   - **Error 404:** Verifica que las rutas estén correctas
   - Revisa los logs en Render para más detalles

✅ **Tu backend está publicado y funcionando.**

---

## 7. PUBLICAR EL FRONTEND (REACT)

### 📦 **7.1 Preparar el proyecto para producción**

1. **Verifica que tu proyecto esté en GitHub:**
   - Si no está, súbelo (ver sección 5.1)

2. **Verifica package.json:**
   - Asegúrate de que en `package.json` tengas el script `build`:
     ```json
     {
       "scripts": {
         "build": "npx vite build",
         "dev": "npx vite",
         "preview": "npx vite preview"
       }
     }
     ```

### 🚀 **7.2 Crear proyecto en Vercel**

1. Ve a: https://vercel.com/dashboard
2. Haz clic en el botón **"Add New..."** → **"Project"**

3. **Importar repositorio:**
   - Si no has conectado GitHub antes:
     - Haz clic en **"Import Git Repository"**
     - Haz clic en **"Continue with GitHub"**
     - Autoriza a Vercel
     - Selecciona tu repositorio `rose-secret`
   - Si ya conectaste GitHub:
     - Busca tu repositorio `rose-secret`
     - Haz clic en **"Import"**

4. **Configurar el proyecto:**
   - **Project Name:** `rosesecret` (o el nombre que quieras)
   - **Framework Preset:** Vercel debería detectar automáticamente **"Vite"**
   - **Root Directory:** Deja vacío (o pon `.` si el frontend está en la raíz)
     - **IMPORTANTE:** Si tu frontend está en la raíz del repositorio, déjalo vacío
     - Si tu frontend está en una carpeta `frontend`, pon `frontend`
   - **Build Command:** `npm run build` (Vercel lo detecta automáticamente)
   - **Output Directory:** `dist` (Vercel lo detecta automáticamente)
   - **Install Command:** `npm install` (Vercel lo detecta automáticamente)

5. **Variables de Entorno (por ahora una, las demás después):**
   - Haz clic en **"Environment Variables"**
   - Agrega:
     ```
     VITE_API_URL = https://tu-backend-url.onrender.com/api
     ```
     *(Reemplaza `tu-backend-url` con la URL real de Render que copiaste antes)*
   - Haz clic en **"Add"**

6. **Deploy:**
   - Haz clic en el botón **"Deploy"** (abajo a la derecha)
   - Espera 1-2 minutos mientras Vercel construye y despliega

### ✅ **7.3 Verificar que el Frontend funciona**

1. **Espera el deployment:**
   - Vercel mostrará el progreso en tiempo real
   - Cuando termine, verás: **"Congratulations! Your deployment has been completed."**

2. **Obtén la URL de tu frontend:**
   - Vercel asigna automáticamente una URL
   - Será algo como: `https://rosesecret.vercel.app`
   - O `https://rosesecret-git-main-tu-usuario.vercel.app`
   - **Copia esta URL** (la necesitarás para actualizar el backend)

3. **Abre tu frontend:**
   - Haz clic en el botón **"Visit"** o abre la URL en tu navegador
   - Deberías ver tu aplicación React cargando

4. **Si hay errores:**
   - Revisa los logs en Vercel
   - Verifica que `VITE_API_URL` esté correcta
   - Verifica que el build haya terminado sin errores

✅ **Tu frontend está publicado.**

---

## 8. CONECTAR FRONTEND CON BACKEND

### 🔗 **8.1 Actualizar CORS en el Backend**

Ahora que tienes la URL del frontend, actualiza las variables de entorno del backend:

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio `rosesecret-backend`
3. Ve a **"Environment"**
4. **Actualiza estas variables:**

   ```
   FRONTEND_URL = https://tu-frontend-url.vercel.app
   ```
   *(Reemplaza con la URL real de Vercel)*

   ```
   ALLOWED_ORIGINS = https://tu-frontend-url.vercel.app
   ```
   *(La misma URL)*

5. Haz clic en **"Save Changes"**
6. Render reiniciará automáticamente el servicio (espera 1-2 minutos)

### 🌐 **8.2 Actualizar VITE_API_URL en el Frontend (si es necesario)**

Si la URL del backend cambió o quieres actualizarla:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `rosesecret`
3. Ve a **"Settings"** → **"Environment Variables"**
4. Edita `VITE_API_URL`:
   ```
   VITE_API_URL = https://tu-backend-url.onrender.com/api
   ```
5. Haz clic en **"Save"**
6. **IMPORTANTE:** Después de cambiar variables de entorno en Vercel, necesitas hacer un nuevo deployment:
   - Ve a **"Deployments"**
   - Haz clic en los 3 puntos (⋯) del último deployment
   - Selecciona **"Redeploy"**
   - Espera a que termine

### ✅ **8.3 Verificar la conexión**

1. **Abre tu frontend en el navegador:**
   - `https://tu-frontend-url.vercel.app`

2. **Abre las herramientas de desarrollador:**
   - Presiona `F12` (o clic derecho → Inspeccionar)
   - Ve a la pestaña **"Console"**

3. **Prueba las funcionalidades:**
   - Intenta hacer login
   - Intenta registrarte
   - Navega por la aplicación

4. **Verifica que no haya errores CORS:**
   - Si ves errores como `CORS policy: No 'Access-Control-Allow-Origin' header`, significa que `FRONTEND_URL` o `ALLOWED_ORIGINS` están mal configuradas
   - Si ves `404 Not Found` en las peticiones, verifica que `VITE_API_URL` termine en `/api`

✅ **Frontend y Backend están conectados.**

---

## 9. CONFIGURAR VARIABLES DE ENTORNO

### 📝 **Resumen de Variables por Plataforma**

#### **Backend (Render) - Todas estas variables:**

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=https://tu-frontend.vercel.app
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
CLOUDINARY_URL=cloudinary://...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...
EMAIL_PROVIDER=gmail
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
EMAIL_FROM_ADDRESS=...
EMAIL_FROM_NAME=Rose Secret
```

#### **Frontend (Vercel) - Solo esta variable:**

```
VITE_API_URL=https://tu-backend.onrender.com/api
```

**Opcional (si usas Stripe en el frontend):**

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 🎯 **Variables Obligatorias vs Opcionales**

#### **Obligatorias (sin estas NO funcionará):**
- Backend: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`
- Frontend: `VITE_API_URL`

#### **Opcionales (pueden desactivarse si no las usas):**
- Stripe: Si no usas pagos, puedes omitir `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY`
- Twilio: Si no usas SMS, puedes omitir todas las variables de Twilio
- Email: Si no usas emails, puedes omitir las variables de email
- Cloudinary: Si no subes imágenes, puedes omitir `CLOUDINARY_URL`

**Nota:** Si omites variables de servicios que tu código usa, puede que haya errores. Mejor déjalas configuradas aunque no las uses activamente.

---

## 10. VALIDACIÓN FINAL (CHECKLIST)

Usa esta checklist para verificar que todo funciona:

### ✅ **Backend**
- [ ] Backend está en línea en Render
- [ ] URL del backend es accesible (ej: `https://rosesecret-backend.onrender.com`)
- [ ] Health check funciona: `https://tu-backend.onrender.com/api/health`
- [ ] No hay errores en los logs de Render
- [ ] Base de datos está conectada (verifica en los logs)

### ✅ **Base de Datos**
- [ ] Base de datos PostgreSQL creada en Neon
- [ ] Tablas creadas correctamente (verifica en SQL Editor de Neon)
- [ ] Conexión desde el backend funciona (sin errores en logs)

### ✅ **Frontend**
- [ ] Frontend está publicado en Vercel
- [ ] URL del frontend es accesible (ej: `https://rosesecret.vercel.app`)
- [ ] La página carga sin errores 404
- [ ] No hay errores en la consola del navegador (F12 → Console)

### ✅ **Conexión Frontend ↔ Backend**
- [ ] No hay errores CORS en la consola del navegador
- [ ] Las peticiones a la API funcionan (verifica en la pestaña "Network" del navegador)
- [ ] Las respuestas de la API llegan correctamente

### ✅ **Funcionalidades Core**
- [ ] **Login funciona:**
  - Puedo hacer login con un usuario existente
  - Recibo un token JWT
  - Soy redirigido después del login
  
- [ ] **Registro funciona:**
  - Puedo crear una nueva cuenta
  - Recibo confirmación
  - Puedo hacer login con la nueva cuenta
  
- [ ] **Account/Perfil funciona:**
  - Puedo ver mi perfil
  - Puedo actualizar mi información
  - Los cambios se guardan

- [ ] **Imágenes funcionan:**
  - Puedo subir imágenes (si aplica)
  - Las imágenes se muestran correctamente
  - Las imágenes persisten después de recargar la página

- [ ] **Emails funcionan (si aplica):**
  - Recibo emails de confirmación
  - Recibo emails de recuperación de contraseña
  - Los emails llegan a mi bandeja de entrada

### ✅ **Compatibilidad con Navegadores**
- [ ] Funciona en **Chrome**
- [ ] Funciona en **Edge**
- [ ] Funciona en **Firefox**
- [ ] Funciona en **Safari** (si tienes acceso)

### ✅ **Seguridad**
- [ ] URL del frontend usa HTTPS (verifica el candado en la barra de direcciones)
- [ ] URL del backend usa HTTPS
- [ ] No hay datos sensibles expuestos en el código fuente (F12 → Sources)

### ✅ **Sin Errores**
- [ ] No hay errores 404 en la consola
- [ ] No hay errores CORS
- [ ] No hay errores de autenticación (401, 403)
- [ ] No hay errores 500 del servidor

---

## 11. TROUBLESHOOTING COMÚN

### 🔴 **Problema: El backend no inicia**

**Síntomas:**
- Render muestra "Build failed" o "Deployment failed"
- Los logs muestran errores

**Soluciones:**
1. **Verifica que `package.json` tenga el script `start`:**
   ```json
   {
     "scripts": {
       "start": "node index.js"
     }
   }
   ```

2. **Verifica que todas las variables de entorno obligatorias estén configuradas:**
   - `NODE_ENV=production`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...`

3. **Revisa los logs en Render:**
   - Ve a "Logs" en el dashboard
   - Busca el error específico
   - Copia el error y búscalo en Google

4. **Verifica que la carpeta `backend` sea correcta:**
   - En Render, verifica que "Root Directory" sea `backend`

---

### 🔴 **Problema: Error de conexión a la base de datos**

**Síntomas:**
- El backend inicia pero los logs muestran "Cannot connect to database"
- Las peticiones a la API fallan con error 500

**Soluciones:**
1. **Verifica que `DATABASE_URL` esté correcta:**
   - Debe empezar con `postgresql://`
   - Debe incluir usuario, contraseña, host, puerto y base de datos
   - No debe tener espacios al inicio o final

2. **Verifica que la base de datos en Neon esté activa:**
   - Ve a https://console.neon.tech
   - Verifica que el proyecto esté "Active"
   - Si está "Paused", haz clic en "Resume"

3. **Prueba la conexión manualmente:**
   - En Neon, ve a "SQL Editor"
   - Ejecuta: `SELECT 1;`
   - Si funciona, la BD está bien

4. **Verifica que las tablas existan:**
   - Ejecuta: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - Debes ver tus tablas listadas

---

### 🔴 **Problema: Error CORS**

**Síntomas:**
- En el navegador (F12 → Console) ves:
  ```
  Access to fetch at '...' from origin '...' has been blocked by CORS policy
  ```

**Soluciones:**
1. **Verifica que `FRONTEND_URL` y `ALLOWED_ORIGINS` en Render sean correctas:**
   - Deben ser exactamente la URL de tu frontend en Vercel
   - Deben incluir `https://`
   - No deben terminar con `/`

2. **Verifica que no haya espacios:**
   - `ALLOWED_ORIGINS=https://tu-frontend.vercel.app` (sin espacios)

3. **Reinicia el backend después de cambiar variables:**
   - Render lo hace automáticamente, pero espera 1-2 minutos

4. **Verifica que el backend esté usando la variable correcta:**
   - Revisa los logs de Render
   - Busca el mensaje que muestra `FRONTEND_URL`

---

### 🔴 **Problema: El frontend no se conecta al backend**

**Síntomas:**
- Las peticiones fallan con 404 o "Network Error"
- La consola muestra errores de conexión

**Soluciones:**
1. **Verifica que `VITE_API_URL` en Vercel sea correcta:**
   - Debe ser: `https://tu-backend.onrender.com/api`
   - Debe incluir `/api` al final
   - Debe usar `https://` (no `http://`)

2. **Después de cambiar `VITE_API_URL`, haz un redeploy:**
   - En Vercel, ve a "Deployments"
   - Haz clic en los 3 puntos (⋯) del último deployment
   - Selecciona "Redeploy"

3. **Verifica que el backend esté funcionando:**
   - Abre `https://tu-backend.onrender.com/api/health` en el navegador
   - Debe responder con JSON

4. **Verifica en la pestaña Network del navegador:**
   - F12 → Network
   - Intenta hacer una acción en tu frontend
   - Verifica qué URL se está llamando
   - Verifica el código de respuesta (200, 404, 500, etc.)

---

### 🔴 **Problema: Las imágenes no se cargan**

**Síntomas:**
- Las imágenes se muestran rotas
- Error 404 al intentar cargar imágenes

**Soluciones:**
1. **Verifica que `CLOUDINARY_URL` esté configurada en Render:**
   - Debe tener el formato: `cloudinary://api_key:api_secret@cloud_name`

2. **Verifica que Cloudinary esté funcionando:**
   - Las imágenes subidas deben estar en Cloudinary
   - Verifica en https://cloudinary.com/console

3. **Verifica que las URLs de las imágenes sean correctas:**
   - En la base de datos, las URLs deben ser de Cloudinary
   - Formato: `https://res.cloudinary.com/...`

---

### 🔴 **Problema: Los emails no se envían**

**Síntomas:**
- No recibes emails de confirmación
- No recibes emails de recuperación de contraseña

**Soluciones:**
1. **Si usas Gmail:**
   - Verifica que `GMAIL_APP_PASSWORD` sea correcta (sin espacios)
   - Verifica que la verificación en 2 pasos esté activada en Google
   - Verifica que la contraseña de aplicación sea válida

2. **Si usas Resend:**
   - Verifica que `RESEND_API_KEY` sea correcta
   - Verifica que el dominio esté verificado en Resend

3. **Revisa los logs del backend:**
   - Busca errores relacionados con email
   - Verifica que el servicio de email esté iniciando correctamente

---

### 🔴 **Problema: El backend se "duerme" en Render**

**Síntomas:**
- La primera petición después de un tiempo tarda mucho (30-60 segundos)
- Render muestra "Your service is sleeping"

**Soluciones:**
1. **Esto es NORMAL en el plan gratuito de Render:**
   - Los servicios gratuitos se duermen después de 15 minutos de inactividad
   - Se despiertan automáticamente cuando reciben una petición

2. **Para evitar que se duerma (opcional, requiere pago):**
   - Actualiza a un plan de pago en Render
   - O usa un servicio de "ping" gratuito como UptimeRobot para hacer peticiones cada 14 minutos

3. **Si quieres aceptar este comportamiento:**
   - Informa a tus usuarios que la primera carga puede tardar
   - O simplemente acéptalo (es gratis, después de todo)

---

### 🔴 **Problema: Build falla en Vercel**

**Síntomas:**
- Vercel muestra "Build Failed"
- No se despliega el frontend

**Soluciones:**
1. **Verifica los logs de build en Vercel:**
   - Ve a "Deployments" → Selecciona el deployment fallido → "Build Logs"
   - Busca el error específico

2. **Errores comunes:**
   - **Error: Module not found:** Verifica que todas las dependencias estén en `package.json`
   - **Error: TypeScript errors:** Corrige los errores de TypeScript
   - **Error: Build command failed:** Verifica que el script `build` en `package.json` sea correcto

3. **Verifica que el Root Directory sea correcto:**
   - Si tu frontend está en la raíz, déjalo vacío o pon `.`
   - Si está en una carpeta `frontend`, pon `frontend`

---

### 🔴 **Problema: Variables de entorno no funcionan en Vercel**

**Síntomas:**
- Las variables de entorno no se aplican
- El frontend sigue usando valores por defecto

**Soluciones:**
1. **IMPORTANTE: En Vite, las variables deben empezar con `VITE_`:**
   - ✅ Correcto: `VITE_API_URL`
   - ❌ Incorrecto: `API_URL`

2. **Después de agregar/cambiar variables, haz un redeploy:**
   - Las variables solo se aplican en nuevos deployments
   - Ve a "Deployments" → "Redeploy"

3. **Verifica que las variables estén en el ambiente correcto:**
   - En Vercel, al agregar variables, selecciona "Production", "Preview" y "Development" según necesites

---

## 🎉 ¡FELICIDADES!

Si llegaste hasta aquí y todas las validaciones pasaron, **¡tu aplicación Rose Secret está publicada y funcionando completamente gratis!**

### 📝 **Resumen de URLs:**

- **Frontend:** `https://tu-frontend.vercel.app`
- **Backend:** `https://tu-backend.onrender.com`
- **Base de datos:** En Neon.tech

### 🔗 **Enlaces útiles:**

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech

### 💡 **Próximos pasos (opcionales):**

1. **Personalizar dominio (requiere pago):**
   - Puedes conectar un dominio personalizado en Vercel y Render (pero requiere comprar el dominio)

2. **Monitoreo:**
   - Usa los logs en Render y Vercel para monitorear tu aplicación

3. **Backups:**
   - Neon hace backups automáticos, pero puedes exportar manualmente desde el SQL Editor

4. **Optimización:**
   - Ajusta las variables de rate limiting según tu tráfico
   - Optimiza las imágenes en Cloudinary

---

## 📞 **Soporte**

Si tienes problemas que no están en esta guía:

1. Revisa los logs en Render y Vercel
2. Busca el error específico en Google
3. Revisa la documentación oficial:
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs
   - Neon: https://neon.tech/docs

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Autor:** Guía para Rose Secret

