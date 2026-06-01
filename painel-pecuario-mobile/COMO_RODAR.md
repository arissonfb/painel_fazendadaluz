# Como rodar e gerar APK do app mobile

## O que mudou

- O app agora está preparado para gerar **APK Android instalável**
- O ícone do app usa o **logo da Fazenda Da Luz**
- O fluxo principal do projeto é **gerar APK e baixar direto no Android**

## Gerar APK Android

Segundo a documentação oficial do Expo, para baixar um app Android instalável é preciso usar **EAS Build** com perfil configurado para APK:

- APK docs: https://docs.expo.dev/build-reference/apk/
- Internal distribution docs: https://docs.expo.dev/build/internal-distribution/

### 1. Instalar e autenticar no Expo

```bash
npm install -g eas-cli
eas login
```

### 2. Entrar na pasta do app

```bash
cd painel-pecuario-mobile
```

### 3. Configurar o projeto no Expo

Na primeira vez:

```bash
eas init
```

### 4. Gerar o APK

```bash
npm run apk
```

Ou diretamente:

```bash
eas build -p android --profile preview
```

Esse perfil `preview` já está configurado no arquivo `eas.json` para gerar **.apk**.

### 5. Baixar o APK

Quando o build terminar, o Expo vai entregar uma URL de download.

Essa URL pode ser:

- aberta direto no celular para instalar o APK
- colocada no sistema web no botão `App no celular`

## Login e dados

Use o mesmo usuário e senha do sistema web:

- Sistema: https://fazenda-daluz.onrender.com

O app e o site usam a mesma API e o mesmo banco:

- o que registrar no app aparece no site
- o que registrar no site aparece no app

## Publicação futura

- `npm run apk`: gera APK para instalação direta
- `npm run aab`: gera build Android mais adequado para Google Play

## Arquivos de identidade visual

Os arquivos abaixo já foram preparados com a marca da Fazenda Da Luz:

- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash.png`
