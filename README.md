# Portfolio

A personal portfolio website built with Astro showcasing my skills, qualifications, projects, and contact information.

## About

This is my personal portfolio website where I showcase my work as a developer. The site includes information about my technical skills, qualifications, featured projects, and ways to get in contact with me.

## Technology Stack

- Astro
- HTML/CSS
- JavaScript
- Cloudflare (deployment)

## Features

- Responsive design
- Dark theme
- Project showcase
- Contact information
- Skills and qualifications display

## Prerequisites

- Node.js >= 22.12.0
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)

## Development

To run this project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview with Cloudflare Workers runtime
npm run preview
```

## Deploy to Cloudflare Pages

### First-time setup

1. Log in to Cloudflare via Wrangler:

   ```bash
   npx wrangler login
   ```

2. Deploy:

   ```bash
   npm run deploy
   ```

   On first deploy, Wrangler will prompt you to create a new Pages project — enter a name and select your account.

### Subsequent deploys

```bash
npm run deploy
```

### CI/CD via GitHub (optional)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select this repository.
3. Set the build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist/client` |
   | Node.js version | `22` |

4. Save and deploy. Every push to `master` will trigger a new deployment automatically.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
MIT License