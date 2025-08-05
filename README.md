# Smart Grocery List

A modern, self-hostable grocery list application with intelligent categorization and localStorage persistence.

![Smart Grocery List App](https://github.com/user-attachments/assets/61e73b22-b38a-45a7-afff-57810a1eb524)

## Features

- ✅ **Smart Categorization**: Automatically categorizes grocery items by store sections (Produce, Dairy & Eggs, Meat & Seafood, etc.)
- ✅ **Local Storage**: All data persists in your browser's localStorage - no external dependencies
- ✅ **Intuitive Interface**: Clean, mobile-friendly design with organized shopping categories
- ✅ **Item Management**: Add items, mark as completed, and reuse past items
- ✅ **Self-Hostable**: No external APIs or services required - runs entirely in your browser

## Self-Hosting & Local Development

This application has been updated to remove all external dependencies (previously used GitHub's Spark SDK) and can now be self-hosted easily.

### Prerequisites

- Node.js 18+ 
- npm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/kelseyrae/smart-grocery-list.git
   cd smart-grocery-list
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5000`

4. **Build for production**
   ```bash
   npm run build
   ```
   
   The built files will be in the `dist/` directory.

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Deployment Options

#### Static Site Hosting
Since this is a client-side only application, you can deploy the built files to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your GitHub repo for automatic deployments
- **GitHub Pages**: Push the `dist/` folder to a `gh-pages` branch
- **Any web server**: Serve the `dist/` folder contents

#### Docker (Optional)
Create a `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
npm run build
docker build -t smart-grocery-list .
docker run -p 8080:80 smart-grocery-list
```

### Data Storage

- **Local Storage**: All grocery list data is stored in your browser's localStorage
- **No Backend Required**: The app works entirely client-side
- **Data Persistence**: Your lists persist across browser sessions
- **Privacy**: All data stays on your device

### Item Categorization

The app automatically categorizes grocery items using an enhanced keyword-matching system:

- **Produce**: Fresh fruits, vegetables, herbs
- **Dairy & Eggs**: Milk, cheese, yogurt, eggs, butter
- **Meat & Seafood**: Fresh/raw meat, fish, poultry
- **Bakery**: Bread, pastries, baked goods
- **Frozen Foods**: Frozen meals, ice cream
- **Canned Goods**: Canned soups, vegetables, sauces
- **Pantry & Dry Goods**: Rice, pasta, spices, condiments
- **Beverages**: Drinks, juices, coffee, tea
- **Snacks**: Chips, crackers, candy, nuts
- **Personal Care**: Hygiene and health items
- **Household & Cleaning**: Detergents, paper products
- **Other**: Items that don't fit other categories

## Development

### Project Structure
```
src/
├── components/ui/          # Reusable UI components
├── hooks/
│   ├── useLocalStorage.ts  # Custom localStorage hook
│   └── use-mobile.ts       # Mobile detection
├── assets/                 # Images and icons
├── styles/                 # CSS and theme files
└── App.tsx                 # Main application component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm start` - Alias for preview (for deployment platforms)

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Build and test with `npm run build && npm run preview`
6. Submit a pull request

## Migration from Spark SDK

This version has been updated to remove the dependency on GitHub's private Spark SDK to enable self-hosting and local development. Changes include:

- ✅ Replaced `useKV` hook with `useLocalStorage` for data persistence
- ✅ Replaced LLM-based categorization with enhanced keyword matching
- ✅ Removed all Spark SDK imports and dependencies
- ✅ Updated build configuration for standard Vite deployment
- ✅ Maintained all core functionality without external dependencies

## License

MIT License - See LICENSE file for details.
