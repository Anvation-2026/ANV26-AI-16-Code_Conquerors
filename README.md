# SafeRouteAI 🛣️🤖
### AI-Powered Safety-Aware Route Planning

**Anvation 2026 | AI / Machine Learning Project**

SafeRouteAI is an AI-powered route analysis prototype that helps users compare alternative journeys using estimated historical accident risk and travel time. By combining machine learning, geospatial analysis, and explainable AI, the system aims to make route planning more safety-aware and transparent.

> **Disclaimer:** SafeRouteAI provides research and demonstration estimates based on historical accident patterns. It does not guarantee road safety, predict with certainty whether an accident will occur, or replace safe driving practices.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Machine Learning Approach](#-machine-learning-approach)
- [Model Evaluation](#-model-evaluation)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [API Endpoints](#-api-endpoints)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Team and Acknowledgements](#-team-and-acknowledgements)

---

## 🎯 Problem Statement

Conventional navigation systems primarily focus on distance and estimated travel time. However, road segments may have different historical accident patterns and contextual characteristics.

Travelers may benefit from additional information when comparing alternative routes, but accident-related information is not always presented in an understandable, route-oriented format.

**Our objective:** Develop a prototype that incorporates historical accident-related information into route analysis and explains the machine learning estimates used to compare routes.

## 💡 Our Solution

SafeRouteAI combines routing services, geospatial feature engineering, an XGBoost classification model, and SHAP-based explainability.

The application analyzes available route alternatives, estimates historical accident-related risk, and presents risk and time comparisons through an interactive dashboard.

The system is designed to support informed decisions rather than guarantee that any route is safe.

## ✨ Key Features

- **Route planning:** Enter a starting location and destination to retrieve route alternatives.
- **Safety-aware comparison:** Compare routes using model-derived risk scores and estimated travel time.
- **Segment-level analysis:** Inspect road-segment information and associated historical accident features.
- **Machine learning:** Use an XGBoost model to estimate accident severity classes.
- **Explainable AI:** Use SHAP to investigate feature contributions to model predictions.
- **Interactive dashboard:** Present route analysis and comparisons through a React interface.
- **REST API:** Connect the frontend to backend routing, prediction, and explanation services.
- **Contextual inputs:** Incorporate available time-related and historical context into route analysis.

*Feature availability depends on the backend services and model artifacts being configured correctly.*

## 🏗️ System Architecture

```text
                  USER
                   |
                   v
        React + Vite Frontend
                   |
                   v
           FastAPI REST API
                   |
          +--------+--------+
          |                 |
          v                 v
    Routing Service   Geospatial Service
          |                 |
          v                 v
     Route Options    Segment Features
                            |
                            v
                    XGBoost ML Model
                            |
                            v
                     Risk Estimation
                            |
                 +----------+----------+
                 |                     |
                 v                     v
          Route Comparison       SHAP Explanation
                 |                     |
                 +----------+----------+
                            |
                            v
                  Dashboard Results
```

### Workflow

1. The user enters a starting point and destination.
2. The routing service retrieves alternative routes.
3. The geospatial service constructs road-segment features using available historical accident data and contextual information.
4. The XGBoost model estimates accident severity probabilities.
5. Model outputs are aggregated into route-level risk scores.
6. Routes are compared by estimated risk and journey time.
7. The explanation service uses SHAP to identify influential model features.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| React | Interactive frontend |
| Vite | Frontend development and build tooling |
| Python | Backend and machine learning |
| FastAPI | REST API |
| XGBoost | Accident severity classification |
| SHAP | Model explainability |
| Pandas | Tabular data processing |
| NumPy | Numerical computations |
| Scikit-learn | Machine learning utilities and evaluation |
| Geospatial and routing services | Location processing and route retrieval |

## 🧠 Machine Learning Approach

SafeRouteAI uses an XGBoost classification model to estimate accident severity classes from structured input features.

### Risk estimation

The model generates class probabilities. These outputs are combined using the model's configured severity weights to calculate a numerical risk score.

A higher score indicates higher estimated risk according to the project's scoring method. It should not be interpreted as the probability of a crash occurring during a particular journey.

### Explainable AI with SHAP

SHAP (SHapley Additive exPlanations) helps explain how individual input features contribute to a model output.

The application is designed to provide feature-level explanations for route or segment analysis. SHAP indicates model attribution, not causation.

## 📊 Model Evaluation

The current reported model evaluation metrics are:

| Metric | Reported Result |
|---|---:|
| Accuracy | 0.870 (87.0%) |
| Weighted F1-score | 0.870 |
| Macro F1-score | 0.541 |

### Interpretation

- **Accuracy:** Proportion of correctly classified samples in the evaluation that produced the metric.
- **Weighted F1-score:** F1-score averaged across classes while accounting for class frequency.
- **Macro F1-score:** F1-score averaged equally across classes.

The difference between weighted F1 and macro F1 indicates that performance may vary across severity classes. Further evaluation should include per-class precision and recall, a confusion matrix, and independent testing.

These are reported evaluation results; they should not be interpreted as a guarantee of real-world prediction performance.

## 📁 Project Structure

```text
SafeRouteAI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.jsx
│   │   │   ├── RoutePlanner.jsx
│   │   │   ├── RouteComparison.jsx
│   │   │   ├── RouteRiskAnalysis.jsx
│   │   │   ├── SegmentTable.jsx
│   │   │   ├── SHAPPanel.jsx
│   │   │   └── RiskLegend.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── models/
│   │   └── risk_model.py
│   ├── services/
│   │   ├── prediction_service.py
│   │   ├── preprocessing.py
│   │   ├── geospatial_service.py
│   │   ├── routing_service.py
│   │   ├── dataset_service.py
│   │   └── shap_service.py
│   ├── data/
│   └── artifacts/
│       ├── model/
│       └── preprocessor/
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3.12 (or a version supported by the installed dependencies)
- Node.js and npm
- Git
- Access to any external routing service required by the configuration

### 1. Clone the repository

```bash
git clone https://github.com/anvation-2026/YOUR-REPOSITORY-NAME.git
cd YOUR-REPOSITORY-NAME
```

Replace `YOUR-REPOSITORY-NAME` with your actual Anvation 2026 repository name.

### 2. Start the backend

Open a terminal in the project root and run:

**Windows PowerShell**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If your model artifacts are not included in the repository, follow the project's model training or artifact-generation instructions before starting the API.

If required by your setup, generate the model artifacts using:

```powershell
python -m models.risk_model
```

Then start the backend:

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Backend API:

- Health check: http://127.0.0.1:8000/api/health
- Model information: http://127.0.0.1:8000/api/model-info
- Interactive API documentation: http://127.0.0.1:8000/docs

Keep the backend terminal running.

### 3. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

http://localhost:5173

If the frontend uses a different configured port, open the URL displayed in the terminal.

### 4. Verify the application

1. Confirm the backend health endpoint responds successfully.
2. Confirm the model information endpoint returns the loaded model details.
3. Open the frontend dashboard.
4. Enter a starting location and destination.
5. Run the route analysis and inspect the results.

If the explanation endpoint fails, check the backend logs and confirm compatibility between the installed SHAP and XGBoost versions.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend and model readiness |
| GET | `/api/model-info` | Model metadata and evaluation information |
| POST | `/api/route` | Retrieve route alternatives |
| POST | `/api/predict` | Predict severity probabilities for supplied features |
| POST | `/api/route-risk` | Analyze and compare route risk |
| GET | `/api/segment/{segment_id}` | Retrieve segment information |
| POST | `/api/explain` | Request SHAP-based model explanations |

### Example request: Route analysis

`POST /api/route-risk`

```json
{
  "start": "San Diego International Airport",
  "end": "Balboa Park"
}
```

Optional contextual fields include `hour`, `day_of_week`, and `month`. Valid ranges are enforced by the API.

### Example request: Model explanation

`POST /api/explain`

```json
{
  "analysis_id": "YOUR_ANALYSIS_ID",
  "route_index": 0,
  "segment_id": null
}
```

Use the `analysis_id` returned by a successful route-risk analysis. The analysis is stored in backend memory, so restarting the backend requires generating the route analysis again.

For complete request and response schemas, start the backend and visit `/docs`.

## ⚠️ Limitations

- Historical accident data may be incomplete, biased, or geographically limited.
- Historical patterns may not represent current road conditions.
- The current prototype does not use live traffic data.
- Weather context uses typical historical San Diego values rather than live weather observations.
- The model's performance may differ across severity classes and geographic regions.
- SHAP explanations describe model behavior and do not establish causation.
- External routing service availability may affect route analysis.
- Risk estimates require further independent validation before any safety-critical deployment.

## 🚀 Future Enhancements

- Integrate live weather and traffic data from reliable providers.
- Expand the historical accident dataset to additional cities.
- Improve evaluation of underrepresented severity classes.
- Add confusion matrices, per-class metrics, and probability calibration.
- Validate model performance on independent locations and time periods.
- Improve resilience to external API failures.
- Develop a mobile-friendly interface.
- Monitor model performance and data drift after deployment.

## 👥 Team and Acknowledgements

**Project:** SafeRouteAI  
**Event:** Anvation 2026  
**Organization:** Anvation 2026 GitHub Organization

**Team ID:** ANV26-AI-16.

**Team members:** JEEVAL.S , CHAYANA.L, ANANYA.S, ASHWIJA.K.N.

We acknowledge the open-source libraries, datasets, and routing services used in the development of this research prototype. Please add the actual dataset citation, routing provider, and relevant licenses here before final submission.



**SafeRouteAI — Making route planning more safety-aware through machine learning and explainable AI.**
