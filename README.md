# JHA Travels - Invoice Generator

A simple, frontend-only invoice generation system for JHA Travels that matches your existing PDF format exactly.

## Features

- **Three Bill Types**: Pickup-Drop, Duration Basis, Distance Basis
- **Dynamic Extras**: Add unlimited extras with reasons
- **Live Preview**: See invoice before generating PDF
- **PDF Generation**: Print/save as PDF using browser
- **Auto-save**: Invoices saved to browser localStorage
- **Mobile Responsive**: Works on all devices
- **No Backend Required**: Pure HTML/CSS/JavaScript

## How to Use

1. **Fill Customer Details**: Name, phone, address
2. **Select Bill Type**: Choose from three options
3. **Enter Bill Details**: Based on selected type
4. **Add Extras**: Optional additional charges
5. **Preview**: Review invoice before generating
6. **Generate PDF**: Print or save to PDF

## Bill Types

### 1. Pickup-Drop Basis
- Pickup location
- Drop location  
- Fixed amount

### 2. Duration Basis
- Number of hours
- Rate per hour
- Optional distance

### 3. Distance Basis
- Distance in km
- Rate per km
- Optional route details

## Deployment

### Simple Hosting (Recommended)
Just upload these files to any web hosting:
- `index.html`
- `style.css` 
- `script.js`

### GitHub Pages
1. Create new repository
2. Upload files
3. Enable GitHub Pages
4. Access via `https://yourusername.github.io/repo-name`

### Netlify (Free)
1. Drag & drop folder to netlify.com
2. Get instant URL
3. Optional: Connect custom domain

## Files

- `index.html` - Main application page
- `style.css` - All styling and responsive design
- `script.js` - All functionality and PDF generation
- `README.md` - This documentation

## Browser Compatibility

- Chrome ✅
- Firefox ✅  
- Safari ✅
- Edge ✅

## PDF Generation

Uses browser's native print function with optimized CSS for perfect PDF output matching your original design.

## Local Development

```bash
# Start local server
python3 -m http.server 8000
# or
npx serve .

# Open http://localhost:8000
```

---

**JHA Travels** - "We Know Journey, Makes Memories"