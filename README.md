# 🎉 Formify - Smart Form Builder with AI

A modern, AI-powered form builder built with Next.js 14, TypeScript, and Tailwind CSS. Create intelligent forms with drag-and-drop simplicity, advanced validation, and real-time analytics.

![Formify Logo](public/logo.svg)

## ✨ Features

- 🤖 **AI-Powered Form Generation** - Describe your form in natural language
- 🎯 **Drag & Drop Interface** - Intuitive form building experience
- 🔍 **Advanced Validation** - Smart validation with custom rules
- 📊 **Real-time Analytics** - Comprehensive form performance insights
- 📱 **Mobile Optimized** - Fully responsive design
- 🌙 **Dark Mode** - Seamless light/dark theme switching
- ↩️ **Undo/Redo** - Full history management
- 📋 **Form Templates** - Pre-built templates for quick start
- 📈 **Submission Dashboard** - Professional data management
- 🔗 **Easy Sharing** - Shareable links and embed codes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/formify.git
   cd formify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📦 Deployment

### Vercel (Recommended)

#### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### Option 2: Vercel Dashboard

1. **Connect your repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect Next.js settings

2. **Configure environment variables**
   - Go to Project Settings → Environment Variables
   - Add your `OPENAI_API_KEY`

3. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

### Environment Variables

Create these environment variables in your deployment platform:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

## 🏗️ Project Structure

```
formify/
├── public/                 # Static assets
│   ├── logo.svg           # Main logo
│   ├── logo-large.svg     # Large logo
│   └── logo-mono.svg      # Monochrome logo
├── src/
│   ├── app/               # Next.js app router
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ui/          # UI components
│   │   └── form-builder/ # Form builder components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utility libraries
│   └── types/           # TypeScript types
├── vercel.json          # Vercel configuration
├── tailwind.config.js   # Tailwind CSS config
├── next.config.js       # Next.js configuration
└── package.json         # Dependencies
```

## 🎨 Customization

### Themes

Formify supports both light and dark themes with automatic system preference detection.

### Branding

- Replace logo files in `/public/` directory
- Update colors in `tailwind.config.js`
- Modify metadata in `src/app/layout.tsx`

### Features

- Enable/disable AI features via environment variables
- Customize form templates in `src/lib/formTemplates.ts`
- Modify validation rules in `src/lib/advancedValidation.ts`

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling

## 📚 API Documentation

### Form Endpoints

- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get form by ID
- `PUT /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form

### Submission Endpoints

- `GET /api/forms/[id]/submissions` - Get form submissions
- `POST /api/forms/[id]/submissions` - Submit form data
- `GET /api/submissions/[id]` - Get submission details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **OpenAI** - AI-powered features
- **Vercel** - Deployment platform

## 📞 Support

- 📧 Email: support@formify.com
- 💬 Discord: [Join our community](https://discord.gg/formify)
- 📖 Documentation: [docs.formify.com](https://docs.formify.com)

---

<div align="center">
  <p>Built with ❤️ using Next.js, TypeScript, and Tailwind CSS</p>
  <p>
    <a href="https://vercel.com?utm_source=formify&utm_campaign=oss">
      <img src="https://vercel.com/button" alt="Powered by Vercel" />
    </a>
  </p>
</div>