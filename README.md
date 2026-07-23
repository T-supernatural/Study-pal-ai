# StudyPal AI 🌟

StudyPal AI is a premium, offline-capable, gamified study companion application designed to transform handwritten paper notes and printed text sheets (via camera capture, images, or PDFs) into elegant, interactive Study Packs.

By integrating state-of-the-art client-side computer vision/preprocessing, fast optical character recognition (OCR), and server-side LLMs, StudyPal AI extracts concepts, automates summaries, compiles revision/exam guides, generates smart voice read-outs, builds interactive flashcards, hosts challenge quizzes, and supplies an on-demand personal academic tutor.

---

## 🚀 Key Features & Capabilities

### 1. Advanced Camera & PDF Upload Pipeline
- **Custom Viewfinder & Live Camera**: Capture notes directly via a built-in viewfinder or use fallback native camera features.
- **Selectable & Scanned PDF Parsing**: Incorporates client-side **PDF.js** to instantly load selectable text layers or render scanned pages onto canvas layers for OCR.
- **Tesseract.js OCR**: Executes multithreaded client-side text recognition to extract handwriting and printed materials.

### 2. High-Performance Client-Side Image Preprocessing
Before running OCR, images are processed through a custom canvas-based pipeline (`src/lib/imageProcessor.ts`) to maximize extraction accuracy under poor lighting:
- **Auto Upscaling**: Automatically scale images 1.5x–2x to keep text details clean for the OCR engine.
- **Relative Luminance Grayscale**: Converts color channels using standard weights (`0.299*R + 0.587*G + 0.114*B`).
- **Contrast & Kernel Convolution**: Performs unsharp masking (for crisp letters) and box blurring (to clear paper artifacts).
- **Bradley-Roth Local Thresholding**: Binarizes the document based on a localized window moving across an **Integral Image**, seamlessly removing shadows cast by hands, mobile devices, or overhead lamps.

### 3. Comprehensive Structured Study Space (Study Packs)
- **Active Checklists**: Core concepts are compiled into touch checklists that update study progress metrics.
- **Natural Voice Reader (TTS)**: Synthesizes high-yield voice lectures based on summaries, glossaries, or the full document using the Web Speech Synthesis API. Includes speed adjustments (0.8x–1.5x), voice filters, and an SVG wave visualizer.
- **3D Flipping Flashcards**: Master vocabulary with responsive, dual-sided 3D memory cards.
- **Gamified Challenge Quizzes**: Instantly test understanding with a 10-question quiz featuring visual feedback and immediate conceptual explanations.
- **Interactive AI Tutor**: Chat directly with a personalized AI companion to simplify complicated formulas, get analogical explanations, or translate passages.

### 4. Smart Dictionary & Vocabulary
Tap any core educational term to query the AI dictionary, instantly retrieving a standardized definition, phonetic pronunciation, intuitive real-world analogy, and distinct study examples.

### 5. Gamified Achievements & Student Persona
- **Mascot Avatars**: Select from six high-quality SVG student mascots.
- **Area Chart Study Analytics**: Features integrated **Recharts** visualizations displaying total study focus time per day and performance metrics.
- **Progressive Milestone Badges**: Unlock Bronze, Silver, Gold, Platinum, and Diamond levels across multiple tracks (*Focus Paladin*, *Consistency Champ*, *Curator of Wisdom*, and *Quiz Master*).

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS v4 (with fluid responsive mobile-first views)
- **Bundler / Server**: Vite 6
- **Animations**: Motion (formerly Framer Motion)
- **Visuals / Charts**: Recharts & Lucide React Icons

### Processing Engine
- **OCR Engine**: Tesseract.js (Multi-language support for English, Spanish, and French)
- **PDF Engine**: PDF.js CDN
- **Speech Engine**: Web Speech Synthesis API (`window.speechSynthesis`)

### Backend Proxy & AI Gateway
- **Server Framework**: Express.js (Node.js) compiled with `esbuild`
- **Generative AI Model**: Google Gemini API (`gemini-3.5-flash`) via the modern `@google/genai` SDK
- **Proxy Capabilities**: Secure token isolation, 25MB body payload buffers to support high-resolution file ingestion.

### Offline Sync Database
- **Local Persistence**: **IndexedDB** using transactional object stores (`study_notes` and `learning_stats`) for fast, offline, asynchronous data syncing.
- **System Configs**: LocalStorage for user identities, goals, and notification feeds.

---

## 📦 Installation & Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/) (or Node.js v18+) installed on your machine.

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd react-example

# Install packages with Bun
bun install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Refer to `.env.example` for details).*

### 3. Run the Development Server
```bash
bun run dev
```
The application will launch on `http://localhost:3000`. In development mode, Vite's server acts as a middleware inside the Express server, supporting real-time Hot Module Replacement (HMR).

### 4. Build for Production
To bundle both the frontend static client and the production Express server:
```bash
bun run build
```
This generates:
- Built static assets in `dist/`
- Compiled and bundled server files in `dist/server.cjs` and source maps.

### 5. Start Production Server
```bash
bun run start
```

---

## 📂 Project Structure

```text
├── assets/                  # AI Studio metadata
├── public/                  # Manifests, PWA Icons, Service Workers
├── src/
│   ├── components/          # React layout modules
│   │   ├── AudioTab.tsx     # Natural Voice player & visualizer
│   │   ├── BottomNav.tsx    # Responsive navigation
│   │   ├── HomeTab.tsx      # Goals, quick actions, notifications
│   │   ├── LibraryTab.tsx   # Study Space, smart dictionary, AI Tutor, Quizzes
│   │   ├── Onboarding.tsx   # Student Profile set up
│   │   ├── ProfileTab.tsx   # Recharts analytics & achievement showcase
│   │   └── UploadTab.tsx    # Processing pipeline, viewfinder, preset samples
│   ├── context/
│   │   └── AppContext.tsx   # Global state, progression calculators, milestones
│   ├── lib/
│   │   ├── imageProcessor.ts # Canvas Bradley-Roth binarizer & filters
│   │   └── indexedDb.ts      # IndexedDB configuration & transactions
│   ├── App.tsx              # App shell & celebration overlays
│   ├── types.ts             # Strong TypeScript schemas
│   └── main.tsx             # Entrypoint
├── server.ts                # Express backend & secure Gemini API gateway
├── vite.config.ts           # Vite configurations
└── tsconfig.json            # TypeScript rules
```

---

## 📈 Future Roadmap
1. **Multi-page PDF OCR**: Parallelizing Tesseract OCR threads using Web Workers to boost PDF extraction speed.
2. **Offline Audio Caching**: Caching local synthesized text-to-speech files.
3. **Advanced Math Handwriting Ingestion**: Integration of specialized LaTeX formatting parsers to render handwritten equations on-screen.
4. **Export Capabilities**: Direct export of summaries and flashcards to formats like PDF, Markdown, or Anki packages.

---

## 📄 License
This project is licensed under the Apache-2.0 License. See the LICENSE details in files where applicable.
