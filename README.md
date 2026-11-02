# 🌍 FoodWise Analytics | Global Food Waste Intelligence Platform

A cutting-edge **interactive 3D globe web application** for visualizing and analyzing food waste data across countries. Built with modern web technologies and designed to provide actionable insights into global food consumption patterns and sustainability challenges.

## Demo
**http://food-waste-web-bucket.s3-website-ap-southeast-2.amazonaws.com/**

## ✨ Features

### 🗺️ Interactive 3D Globe Visualization
- **Fully rotatable 3D globe** using Three.js rendering engine
- **Country-based flag markers** for intuitive geographic navigation
- **Smooth animations** and responsive interactions
- **Real-time data representation** of food waste metrics

### 📊 Smart Dynamic Analysis
- **Multi-country comparison** (select up to 5 countries simultaneously)
- **Advanced charting capabilities**:
  - Bar charts for waste category breakdown
  - Radar charts for multi-dimensional analysis
  - Line charts for temporal trends
  - Detailed comparison tables

### 🔬 Data-Driven Intelligence
- **Root Cause Analysis**: Identifies primary drivers of food waste in selected regions
- **Customized Reduction Solutions**: AI-powered recommendations tailored to specific countries
- **Policy Recommendations**: Evidence-based insights for sustainable waste reduction
- **Comprehensive Analytics**: Detailed statistics and trends visualization

### 🎨 User Experience
- **Dark/Light Mode Toggle**: Customizable viewing experience
- **Responsive Design**: Seamless experience across desktop and tablet devices
- **Intuitive Controls**: Clear selection panel and reset functionality
- **Real-time Updates**: Dynamic data analysis as selections change

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **3D Visualization** | Three.js v0.132.2 |
| **Charts & Analytics** | Chart.js v4.4.0 |
| **Build Tool** | Vite v2.6.4 |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Package Manager** | npm |
| **Styling** | Modern CSS with animations |

## 📁 Project Structure

```
.
├── index.html              # Main application entry point
├── package.json            # Project dependencies and configuration
├── vite.config.js          # Vite build configuration
├── css/                    # Stylesheets
│   └── styles.css         # Main styles and responsive design
├── js/                     # JavaScript modules
│   └── main.js            # Application logic and interactivity
├── components/             # Reusable UI components
└── data/                   # Food waste analytics data
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OoiKeXin/Food-Waste-Analytics-Dashboard-Using-AWS-Serverless-Architecture.git
   cd Food-Waste-Analytics-Dashboard-Using-AWS-Serverless-Architecture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or another port if 5173 is in use)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### 1. **Navigating the Globe**
   - **Rotate**: Click and drag to rotate the Earth
   - **Zoom**: Use mouse wheel to zoom in/out
   - **Pan**: Right-click and drag for panning

### 2. **Selecting Countries**
   - Click on any country flag on the globe
   - Selection panel shows currently selected countries
   - Maximum 5 countries can be selected for comparison
   - Selected items are highlighted visually

### 3. **Running Analysis**
   - After selecting 1-5 countries, click **"Deep Dynamic Analysis"** button
   - Analysis modal displays comprehensive insights including:
     - Comparative waste metrics across categories
     - Multi-dimensional radar analysis
     - Temporal trend visualization
     - Detailed comparison table
     - Root cause analysis
     - Customized reduction solutions
     - Policy recommendations

### 4. **Theme & Controls**
   - **Light Mode Toggle**: Switch between dark and light themes for comfortable viewing
   - **Clear Selection**: Reset all selections and start fresh analysis

## 📊 Data Categories

The platform analyzes food waste across multiple sectors:

- **Total Waste**: Overall food waste generation
- **Household Waste**: Consumer-level food waste
- **Retail Waste**: Commercial retail sector waste
- **Food Service Waste**: Restaurant and catering waste
- **Global Comparison**: Relative performance metrics

## 🌱 Sustainability Focus

This platform is designed to:
- **Raise Awareness** about global food waste challenges
- **Enable Data-Driven Decision Making** through comprehensive analytics
- **Support Sustainability Goals** aligned with UN SDGs
- **Identify Reduction Opportunities** through comparative analysis
- **Drive Policy Improvements** with evidence-based recommendations

## 🔐 Keywords

`food-waste` · `data-visualization` · `3d-globe` · `aws` · `sustainability` · `analytics` · `environmental-impact` · `chart.js` · `three.js` · `serverless-architecture`

## 📄 License

This project is licensed under the **MIT License** - see LICENSE file for details.

## 👥 Author

**FoodWise Analytics Team** - Global Food Waste Intelligence Initiative

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request to help improve this platform.

## 📞 Support & Feedback

For issues, questions, or suggestions, please open an [issue](https://github.com/OoiKeXin/Food-Waste-Analytics-Dashboard-Using-AWS-Serverless-Architecture/issues) on GitHub.

## 🔮 Future Enhancements

- [ ] AWS integration for cloud-based data processing
- [ ] Real-time data feeds from global sources
- [ ] Machine learning predictions for waste trends
- [ ] Export reports to PDF/Excel
- [ ] Mobile app version
- [ ] Collaborative analysis features
- [ ] Advanced filtering and segmentation

---

**Making data actionable for a more sustainable world** 🌍♻️
