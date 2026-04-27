# Controle de Estoque — PWA

Sistema de estoque mobile-first com scanner de código de barras, controle de validade por lote e relatório automático via WhatsApp. Roda 100% no navegador, sem backend, sem mensalidade.

## Conteúdo do pacote

```
estoque-app/
├── index.html              ← App principal
├── manifest.json           ← Define que é PWA
├── sw.js                   ← Service worker (offline)
├── vercel.json             ← Config de deploy Vercel
├── icon-192.png            ← Ícone padrão
├── icon-512.png            ← Ícone alta resolução
├── icon-maskable-512.png   ← Ícone adaptativo Android
├── apple-touch-icon.png    ← Ícone iOS
└── favicon.png             ← Aba do navegador
```

---

## Deploy na Vercel (5 minutos)

### Opção A — Via Vercel CLI (mais rápido)

```bash
cd estoque-app
npx vercel
```

Responde as perguntas (login, nome do projeto) e tá no ar. URL do tipo `https://estoque-xxx.vercel.app`.

### Opção B — Via interface web

1. Sobe a pasta num repositório GitHub (`estoque-app`)
2. Vai em [vercel.com/new](https://vercel.com/new)
3. Importa o repo
4. Clica em **Deploy** (não precisa configurar nada — é HTML estático)

---

## Instalando no celular

### Android (Chrome)

1. Abre a URL da Vercel no Chrome do celular
2. Aparece um banner **"Adicionar à tela inicial"** — toca
3. (Ou no menu ⋮ → **Instalar aplicativo**)
4. O ícone aparece na tela inicial. Pronto, é app.

### iPhone (Safari)

1. Abre a URL no **Safari** (precisa ser Safari, não Chrome)
2. Toca no botão **Compartilhar** (quadrado com seta pra cima)
3. Rola e toca em **Adicionar à Tela de Início**
4. Confirma

A partir daí abre fullscreen, sem barra do navegador, igual app nativo.

---

## Câmera e HTTPS

Scanner de código de barras **só funciona em HTTPS**. A Vercel já entrega HTTPS automaticamente, então tá tudo certo. Se for hospedar em outro lugar (Hostinger, Easypanel, etc), garante que tem certificado SSL ativo.

Na primeira vez que escanear, o navegador vai pedir permissão de câmera. Aceita e fica memorizado.

---

## Funciona offline?

Sim. Depois da primeira carga:
- App carrega sem internet (HTML, CSS, JS, ícones, fontes ficam no cache)
- Dados ficam salvos no **IndexedDB** local do celular
- Scanner funciona offline (lib do ZXing fica em cache)
- A única coisa que precisa de internet é mandar o relatório pro WhatsApp

---

## Backup dos dados (importante!)

Como é tudo local, se o usuário limpar dados do navegador ou trocar de celular, perde o histórico. Por isso:

- **Em Ajustes → Exportar backup**: gera um JSON com todos os produtos, lotes e configurações
- **Em Ajustes → Importar backup**: restaura tudo

Recomendação: exportar uma vez por semana e mandar pro Drive ou pro próprio WhatsApp.

---

## Quero distribuir como APK na Play Store

Possível, mas geralmente desnecessário. Se quiser mesmo:

1. Vai em [pwabuilder.com](https://www.pwabuilder.com)
2. Cola a URL do app na Vercel
3. Clica em **Package for stores → Android**
4. Baixa o APK ou AAB e publica

PWABuilder usa Bubblewrap (Trusted Web Activity) — basicamente empacota o PWA num shell Android nativo. Resultado é igual a um app de verdade.

---

## Customizando

### Trocar nome e cor

Edita `manifest.json`:
```json
{
  "name": "Seu Nome Aqui",
  "theme_color": "#0f172a",       ← cor da barra de status
  "background_color": "#fafaf9"   ← cor de splash screen
}
```

### Trocar ícone

Substitui os 5 PNGs (mantém os mesmos nomes/tamanhos). Ferramenta rápida: [maskable.app/editor](https://maskable.app/editor) gera todos os tamanhos a partir de uma imagem.

---

## Stack

- HTML/CSS/JS puro, zero dependência de build
- IndexedDB para persistência local
- ZXing-browser para leitura de código de barras (EAN-13, Code 128, QR, etc)
- Service Worker para cache offline
- Sem framework, sem npm install, sem nada

Arquivo único de ~73KB. Carrega instantâneo.

---

## Limites conhecidos

- iOS Safari tem cota de armazenamento mais agressiva — em uso pesado (milhares de produtos), pode ser purgado. Backup semanal resolve.
- Android Chrome dá warning se o site não for visitado em 30+ dias (descarrega cache). App segue funcionando após nova carga.
- Câmera no iPhone só funciona em Safari nativo (não funciona em Chrome iOS — limitação do iOS, não do app).
