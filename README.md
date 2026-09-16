# Merchant Ring ⚡

**Merchant Ring** is an interactive AI-powered FinTech & BFSI analytics dashboard designed for real-time UPI fraud ring detection, merchant risk profiling, and dispute monitoring. Built with React 19, Tailwind CSS, Recharts, and an integrated hands-free Voice AI Assistant.

---

## 📌 Features & Highlights

* **Overview & KPI Tracking**: Monitor total transaction volume (₹23.92 Cr), failure rates (29.18%), dispute ratios (12.91%), and KYC verification stats.
* **Merchant Risk & Fraud Hub**: Pinpoint high-risk merchant segments and track 128 repeat dispute users operating in organized fraud rings.
* **Interactive ML Notebook Viewer**: Integrated Google Colab style notebook viewer to inspect EDA, feature engineering, and data preprocessing code.
* **Hands-Free Voice AI Assistant**: Real-time speech recognition and natural female voice response that automatically updates chart visual colors per query.

---

## 📊 EDA & Preprocessing (Google Colab Workflow)

Data cleaning and Exploratory Data Analysis (EDA) were executed in Google Colab (`data-cleaned.ipynb`):

1. **Data Cleaning & Sanitization**: Filtered invalid records, formatted timestamps, and structured merchant category codes.
2. **Feature Engineering**: Built custom metrics for dispute ratios, KYC status correlations, and repeat user transaction frequencies.
3. **Anomaly Detection**: Flagged high-volume chargeback spikes and isolated merchant accounts with excessive dispute ratios (>2.5%).
4. **Data Packaging**: Aggregated 20,000+ raw records into structured JSON payloads (`fintech_processed_data.json`) for zero-latency dashboard rendering.

---

## 📁 Repository Structure

```
Merchant-Ring/
├── data-cleaned.ipynb              # Google Colab notebook (EDA & Preprocessing)
├── index.html                      # Entry HTML with page title & fonts
├── package.json                    # Dependencies and build scripts
├── vercel.json                     # Vercel deployment configuration
├── vite.config.js                  # Vite configuration
└── src/
    ├── App.jsx                     # Main application shell & tab routing
    ├── components/
    │   ├── AIAgentPanel.jsx        # Voice AI Assistant (Speech API & Voice Output)
    │   ├── NotebookModal.jsx       # Google Colab style foldable code viewer
    │   ├── DriveModal.jsx          # Dataset links modal
    │   ├── KPICards.jsx            # KPI cards component
    │   ├── SlicersBar.jsx          # Global filter controls
    │   └── sections/               # Tab sections (Overview, Risk, Fraud Hub)
    └── data/
        ├── data_cleaned_notebook.json # Formatted notebook JSON payload
        └── fintech_processed_data.json # Aggregated dataset metrics
```

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abinavgt/Merchant-Ring.git
   cd Merchant-Ring
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 6, Tailwind CSS v4, Framer Motion
* **Visualizations**: Recharts, Lucide React Icons
* **Voice AI**: Web Speech API (Recognition & Synthesis)
* **Deployment**: Vercel
