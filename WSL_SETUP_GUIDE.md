# GUÍA COMPLETA: Trabajar con WSL + Windsurf

## 📋 ÍNDICE
1. [¿Qué es WSL?](#qué-es-wsl)
2. [Instalación de WSL](#instalación-de-wsl)
3. [Configuración con Windsurf](#configuración-con-windsurf)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Comandos Útiles](#comandos-útiles)
6. [Solución de Problemas](#solución-de-problemas)
7. [Windsurf vs VS Code para WSL](#windsurf-vs-vs-code-para-wsl)

---

## ¿QUÉ ES WSL?

WSL permite ejecutar Linux nativamente en Windows sin máquina virtual.

**Ventajas:**
- ✅ Rendimiento superior para Node.js
- ✅ Herramientas Linux nativas (grep, curl, git)
- ✅ Entorno idéntico a servidores de producción
- ✅ Docker nativo
- ✅ Gratis e integrado en Windows 10/11

---

## INSTALACIÓN DE WSL

### Paso 1: Instalar WSL (como administrador)
```powershell
# Abrir PowerShell COMO ADMINISTRADOR
wsl --install

# Esto instala Ubuntu por defecto
# Reiniciar el equipo cuando lo pida
```

### Paso 2: Configurar Ubuntu
```bash
# Al reiniciar, se abre terminal de Ubuntu
# Crear usuario y contraseña cuando lo pida
username: tu_usuario
password: tu_contraseña

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
```

### Paso 3: Instalar Node.js en WSL
```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x
```

### Paso 4: Instalar herramientas adicionales
```bash
# Git (si no está instalado)
sudo apt install git -y

# Herramientas útiles
sudo apt install curl wget vim nano -y

# Configurar Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## CONFIGURACIÓN CON WINDSURF

### Opción A: Windsurf + Terminal WSL (RECOMENDADO)

#### En tu Laptop Windows con Windsurf:
1. **Abrir Windsurf** en tu proyecto
2. **Configurar Terminal Integrada para WSL:**
   - Presiona `` Ctrl+` `` (acento invertido) para abrir terminal
   - Click en el dropdown del terminal (donde dice "powershell" o "cmd")
   - Seleccionar "WSL" o "Ubuntu"
   - Si no aparece: Click en "Select Default Profile" → "WSL"

3. **Verificar conexión WSL:**
   ```bash
   # En terminal de Windsurf
   wsl
   cd /mnt/c/web-hq-ant
   ls -la
   ```

4. **Trabajar con archivos Windows en WSL:**
   ```bash
   # Desde WSL en terminal Windsurf
   cd /mnt/c/web-hq-ant/backend
   npm start
   ```

#### Ventajas:
- Editas en Windsurf (Windows)
- Terminal WSL integrada
- Archivos accesibles desde ambos lados
- Sin cambiar de ventanas

---

### Opción B: Sincronización con Git

#### Configurar repositorio remoto (GitHub/GitLab)

**En Laptop (Windows):**
```powershell
cd c:\web-hq-ant
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuusuario/tu-repo.git
git push -u origin main
```

**En WSL (Linux):**
```bash
# Clonar proyecto
cd ~
git clone https://github.com/tuusuario/tu-repo.git
cd tu-repo

# Instalar dependencias del backend
cd backend
npm install

# Ejecutar servidor
npm start
```

#### Flujo de trabajo Git:
```bash
# 1. En laptop, hacer cambios y subir
git add .
git commit -m "Cambios en frontend"
git push origin main

# 2. En WSL, bajar cambios
git pull origin main

# 3. Reiniciar servidor si es necesario
pm2 restart all  # o npm start
```

---

### Opción C: Compartir Carpetas (SMB)

#### En Laptop (Windows):
1. **Compartir carpeta del proyecto:**
   - Click derecho en `c:\web-hq-ant` → Propiedades
   - Compartir → Compartir con... → Everyone → Read/Write

2. **Obtener IP de tu laptop:**
   ```powershell
   ipconfig
   # Buscar "IPv4 Address" (ejemplo: 192.168.1.100)
   ```

#### En WSL (Linux):
```bash
# Instalar herramientas SMB
sudo apt install cifs-utils -y

# Crear punto de montaje
sudo mkdir -p /mnt/web-hq-ant

# Montar carpeta compartida (reemplaza IP y usuario)
sudo mount -t cifs //192.168.1.100/web-hq-ant /mnt/web-hq-ant \
  -o username=tu_usuario_windows,password=tu_password_windows

# Verificar acceso
ls /mnt/web-hq-ant

# Entrar al backend y ejecutar
cd /mnt/web-hq-ant/backend
npm install  # Solo primera vez
npm start
```

#### Para desmontar:
```bash
sudo umount /mnt/web-hq-ant
```

---

## FLUJO DE TRABAJO

### Escenario Recomendado: VS Code Remote

#### 1. Iniciar WSL
```powershell
# Abrir terminal en Windows
wsl

# O desde menú inicio: "Ubuntu"
```

#### 2. Navegar al proyecto
```bash
cd /mnt/c/web-hq-ant
ls -la  # Ver archivos
```

#### 3. Ejecutar Backend (en WSL)
```bash
cd /mnt/c/web-hq-ant/backend

# Si es primera vez
npm install

# Ejecutar servidor
npm start

# Debería mostrar: "Server running on port 3000"
```

#### 4. Editar Frontend (en Windsurf)
- Abrir Windsurf normal (con WSL en terminal integrada)
- Abrir carpeta `c:\web-hq-ant`
- Editar archivos HTML, CSS, JS
- Guardar cambios (se reflejan automáticamente en WSL)

#### 5. Acceder desde navegador
- Backend: `http://localhost:3000`
- Frontend: Abrir archivos HTML directamente o usar Live Server

---

## COMANDOS ÚTILES

### WSL Básicos
```bash
# Ver distribuciones instaladas
wsl --list --verbose

# Cambiar versión WSL (1 o 2)
wsl --set-version Ubuntu 2

# Terminar todas las sesiones WSL
wsl --shutdown

# Desinstalar distribución
wsl --unregister Ubuntu
```

### Navegación de Archivos
```bash
# Windows → WSL
/mnt/c/          # Disco C:
/mnt/d/          # Disco D:
/mnt/c/web-hq-ant # Tu proyecto

# Rutas comunes Windows en WSL
/mnt/c/Users/TuUsuario/Desktop
/mnt/c/Users/TuUsuario/Documents
```

### Gestión de Procesos
```bash
# Ver procesos Node.js
ps aux | grep node

# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# Ejecutar en segundo plano
npm start &

# Usar PM2 para gestión de procesos
sudo npm install -g pm2
pm2 start backend/src/server.js --name "hpower-api"
pm2 logs
pm2 restart hpower-api
pm2 stop hpower-api
```

### Red y Conexión
```bash
# Ver IP de WSL
ip addr show eth0 | grep 'inet '

# Verificar puertos abiertos
netstat -tulpn | grep 3000

# Probar conexión a backend
curl http://localhost:3000/api/health
```

---

## SOLUCIÓN DE PROBLEMAS

### Problema 1: "WSL not found"
```powershell
# Habilitar características de Windows
# Panel de Control → Programas → Activar o desactivar características
# Habilitar:
# - Subsistema de Windows para Linux
# - Plataforma de máquina virtual
# Reiniciar
```

### Problema 2: Permisos de archivos
```bash
# Si tienes problemas de permisos en archivos Windows
sudo chmod -R 777 /mnt/c/web-hq-ant/backend

# O mejor: cambiar propietario
sudo chown -R $(whoami):$(whoami) /mnt/c/web-hq-ant/backend
```

### Problema 3: Node.js no funciona
```bash
# Verificar instalación
which node
which npm

# Si no están, reinstalar
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Limpiar caché npm si hay problemas
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problema 4: Puerto 3000 ocupado
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O usar otro puerto
PORT=3001 npm start
```

### Problema 5: Cambios no se reflejan
```bash
# Si editas en Windows pero WSL no ve cambios
# Reiniciar WSL
wsl --shutdown

# Volver a abrir WSL y montar
```

### Problema 6: Error "bad interpreter"
```bash
# Si hay problemas con finales de línea Windows/Linux
sudo apt install dos2unix
dos2unix backend/src/server.js
```

---

## CONFIGURACIÓN AVANZADA

### Configurar Windsurf para WSL

#### 1. Establecer WSL como terminal predeterminado
```json
// En Windsurf: File → Preferences → Settings (Ctrl+,)
// Buscar "terminal.integrated.defaultProfile.windows"
// Seleccionar "WSL" o "Ubuntu"
```

#### 2. Atajo de teclado rápido
```json
// settings.json de Windsurf
{
  "terminal.integrated.defaultProfile.windows": "WSL",
  "terminal.integrated.cwd": "${workspaceFolder}"
}
```

#### 3. Crear archivo de configuración WSL
```powershell
# En Windows, crear archivo
notepad "$env:USERPROFILE\.wslconfig"
```

#### Contenido recomendado:
```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
localhostForwarding=true
```

### Alias útiles para Windsurf + WSL
```bash
# Abrir ~/.bashrc
nano ~/.bashrc

# Añadir al final - Atajos para tu proyecto:
alias hp-start='cd /mnt/c/web-hq-ant/backend && npm start'
alias hp-install='cd /mnt/c/web-hq-ant/backend && npm install'
alias hp-logs='cd /mnt/c/web-hq-ant/backend && npm run logs'
alias hp-project='cd /mnt/c/web-hq-ant'
alias hp-backend='cd /mnt/c/web-hq-ant/backend'
alias hp-frontend='cd /mnt/c/web-hq-ant'

# Recargar configuración
source ~/.bashrc

# Uso:
hp-project    # Va al proyecto
hp-start      # Inicia servidor backend
```

---

## RESUMEN DE COMANDOS RÁPIDOS

### Iniciar día de trabajo:
```bash
# 1. Abrir WSL
wsl

# 2. Ir al proyecto
cd /mnt/c/web-hq-ant/backend

# 3. Iniciar servidor
npm start

# 4. Dejar corriendo y usar Windsurf para editar
```

### Flujo de trabajo diario:
```bash
# Laptop: Editar en Windsurf
# Terminal Windsurf: WSL corriendo servidor
# Navegador: http://localhost:3000
```

---

## WINDSURF VS VS CODE PARA WSL

### **¿Por qué usar Windsurf con WSL?**

| Característica | Windsurf | VS Code |
|----------------|----------|---------|
| **Integración WSL** | Terminal integrada, archivos accesibles | Extensión Remote-WSL nativa |
| **Rendimiento** | Similar | Similar |
| **Facilidad** | Terminal WSL integrada | Requiere extensión adicional |
| **Funciones AI** | ✅ Integradas (Cascade) | ❌ Requiere extensiones |
| **Precio** | Gratis / Pro de pago | Gratis |

### **Ventajas de Windsurf para tu proyecto:**
- **Cascade AI**: Puedes usar la IA para ayudarte con código mientras trabajas en WSL
- **Terminal integrada**: WSL directo sin cambiar ventanas
- **Experiencia unificada**: Todo en una sola aplicación

### **Limitaciones:**
- No tiene "Remote-WSL" como VS Code (extensión oficial de Microsoft)
- Pero funciona perfecto con la **terminal integrada**

---

## RECURSOS ADICIONALES

- Documentación WSL: https://docs.microsoft.com/es-es/windows/wsl/
- Node.js en WSL: https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
- Windsurf Docs: https://docs.codeium.com/

---

**¿Listo para empezar?**
1. Instala WSL (15 min)
2. Abre Windsurf y configura terminal WSL (5 min)
3. Ejecuta tu backend (5 min)

**¡Total: ~25 minutos para un entorno profesional!**

---

**Diferencia clave con VS Code:**
- **VS Code**: Usa extensión "Remote-WSL", editas archivos directamente en Linux
- **Windsurf**: Usa terminal integrada WSL, editas archivos Windows pero ejecutas en Linux

**Ambos funcionan igual de bien, elige el que prefieras.**
