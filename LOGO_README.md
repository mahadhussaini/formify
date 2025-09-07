# Formify Logo Usage Guide

## Logo Files

### Primary Logo
- **File**: `public/logo.svg`
- **Size**: 32x32px (scalable SVG)
- **Usage**: Main application logo with checkmark icon
- **Colors**: Uses `currentColor` for theme compatibility

### Large Logo
- **File**: `public/logo-large.svg`
- **Size**: 64x64px (scalable SVG)
- **Usage**: Hero sections, marketing materials
- **Colors**: Uses `currentColor` for theme compatibility

### Monochrome Logo
- **File**: `public/logo-mono.svg`
- **Size**: 32x32px (scalable SVG)
- **Usage**: Favicons, simple contexts
- **Colors**: Single color, no checkmark

## Logo Component

The `Logo` component provides consistent logo usage across the application:

```tsx
import { Logo } from '@/components/Logo'

// Basic usage
<Logo />

// With custom size
<Logo size="lg" />

// Hide text (icon only)
<Logo showText={false} />

// Custom classes
<Logo className="my-custom-class" textClassName="text-primary" />
```

### Props
- `size`: `'sm' | 'md' | 'lg' | 'xl'` - Controls logo size
- `showText`: `boolean` - Whether to show "Formify" text
- `className`: `string` - Custom container classes
- `textClassName`: `string` - Custom text classes

## Design Guidelines

### Logo Symbol
The logo represents a form/document with:
- Rounded rectangle (form container)
- Horizontal lines (form fields)
- Checkmark icon (completion/validation)
- Clean, minimal design
- Scalable vector graphics

### Colors
- **Primary**: Uses CSS `currentColor` for automatic theme adaptation
- **Light Theme**: Inherits text color
- **Dark Theme**: Inherits text color
- **Monochrome**: Single color for simple contexts

### Spacing
- **Icon + Text**: 8px gap between logo icon and "Formify" text
- **Minimum Clear Space**: Logo height should be used as clear space
- **Touch Targets**: Minimum 44px for interactive elements

### Usage Contexts
- **Header/Navigation**: 32px icon with text
- **Marketing/Hero**: 64px icon for prominence
- **Footer/Small**: 24px icon only
- **Favicons**: SVG format for crisp display

## Technical Implementation

### Favicon Setup
The logo is automatically used as favicon through Next.js metadata:

```typescript
// src/app/layout.tsx
icons: {
  icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
  shortcut: '/logo.svg',
  apple: [{ url: '/logo.svg', type: 'image/svg+xml' }],
}
```

### Responsive Design
- Logo scales automatically with container size
- Text hides on small screens (`hidden sm:inline`)
- Touch-friendly sizing for mobile devices

### Accessibility
- Proper `alt` attributes for screen readers
- Semantic HTML structure
- Focus management maintained

## Logo Variations

### Standard Logo
- Full logo with icon and text
- Used in headers and main branding

### Icon Only
- Logo symbol without text
- Used in favicons and compact spaces

### Large Logo
- Hero section and marketing use
- More prominent presence

## Development Notes

- All logos are SVG format for crisp scaling
- Uses `currentColor` for theme compatibility
- Optimized file sizes for web performance
- Consistent aspect ratios maintained
- Mobile-responsive by default
