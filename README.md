# 🧠 ARIS — Amazon Review Intelligence Suite

> AI-powered review quality prediction using MiniLM embeddings, XGBoost classification, and SHAP explainability.

[![Built for Amazon ML Summer School 2026](https://img.shields.io/badge/Amazon%20ML-Summer%20School%202026-FF9900?style=flat-square&logo=amazon)](https://amazonmlsummerschool.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org)

---

## ✨ Overview

ARIS is a **full-stack ML application** that predicts the helpfulness of Amazon product reviews using a hybrid architecture combining **MiniLM-L6-v2 sentence embeddings** with **XGBoost gradient boosting**, accompanied by **TreeSHAP explainability** for transparent, auditable predictions.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Helpfulness Prediction** | Binary classification with 390-dimensional hybrid feature vectors |
| 💬 **Sentiment Analysis** | Real-time polarity detection with confidence calibration |
| 🧠 **Explainable AI** | TreeSHAP feature attribution at both tabular and word levels |
| 📊 **Analytics Dashboard** | Model metrics, sentiment distribution, quality breakdowns |
| 💡 **Business Insights** | Keyword correlations, optimal review length analysis |
| 🛡️ **Error Diagnostics** | Confusion matrix, failure case studies, weakness identification |
| 📈 **Model Evaluation** | 4-model leaderboard with derived classification metrics |

---

## 🏗️ Architecture

```
Raw Review Text
      │
      ├── Feature Engineering (6 tabular features)
      │     word_count, char_count, avg_word_len,
      │     sentiment, readability, excl_density
      │
      ├── MiniLM-L6-v2 Embeddings (384 dimensions)
      │
      └── Feature Fusion (390 dimensions)
              │
              ├── XGBoost Classifier → Helpfulness Score
              └── TreeSHAP Engine  → Feature Attributions
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# API available at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard at http://localhost:3000
```

---

## 📊 Model Leaderboard

| Rank | Model | Accuracy | F1-Score | ROC-AUC |
|------|-------|----------|----------|---------|
| 🥇 1 | **MiniLM + XGBoost (Hybrid)** | 67.8% | 67.0% | 74.3% |
| 🥈 2 | Random Forest | 67.8% | 66.9% | 74.8% |
| 🥉 3 | Logistic Regression | 68.3% | 66.9% | 74.1% |
| 4 | XGBoost (TF-IDF) | 66.2% | 62.2% | 72.9% |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **ML Pipeline** | Python, XGBoost, scikit-learn, MiniLM-L6-v2, SHAP |
| **Backend** | FastAPI, SQLite, Pydantic |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Recharts, Framer Motion |
| **Design** | Glassmorphism, Inter font, Lucide Icons |

---

## 📁 Project Structure

```
├── backend/          # FastAPI inference server
│   ├── main.py       # API endpoints & ML pipeline
│   └── requirements.txt
├── frontend/         # Next.js 14 dashboard
│   ├── app/          # Pages (analyzer, explain, analytics, etc.)
│   ├── components/   # Reusable UI components
│   └── lib/          # API client & types
├── ml/               # Training pipeline & model artifacts
│   ├── models/       # Trained .pkl files & metrics JSON
│   └── train.py      # Training script
├── data/             # Dataset (excluded from repo)
└── tests/            # Test suite
```

---

## 📄 License

Built as a portfolio project for Amazon ML Summer School 2026.

---

<p align="center">
  <strong>Built with ❤️ by Gowtham Sai</strong>
</p>
