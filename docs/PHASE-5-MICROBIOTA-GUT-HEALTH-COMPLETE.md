# Phase 5: Microbiota & Gut Health - COMPLETE ✅

## Overview
Implemented comprehensive microbiome analysis, fermentation prediction, and gut-brain axis tracking capabilities to help users understand and optimize their gut health.

## Implementation Date
Completed: Phase 5

## What Was Built

### 1. Database Schema Extension

#### MicrobiomeResult Model (`prisma/schema.prisma`)
Created a comprehensive model to store microbiome test results with:

**Diversity Metrics:**
- Shannon Index (target: >4.0)
- Simpson Index
- Species Richness

**Phyla Distribution:**
- Firmicutes percentage
- Bacteroidetes percentage
- Actinobacteria percentage
- Proteobacteria percentage
- Verrucomicrobia percentage
- Other percentage

**Key Beneficial Bacteria:**
- Akkermansia muciniphila
- Bifidobacterium
- Lactobacillus
- Faecalibacterium prausnitzii

**Health Indicators:**
- Inflammation risk (0-10 scale)
- Gut permeability risk (0-10 scale)
- Digestion score (0-100)

**Additional Data:**
- Pathogen detection
- SCFA-producing bacteria identification
- Species composition breakdown
- Raw test data storage
- PDF link storage

**Relations:**
- Added `microbiomeResults` relation to User model

### 2. Microbiome Analysis Library (`lib/microbiome/analysis.ts`)

#### Multi-Source Test Parsing
Supports parsing test results from:
- **Viome**: Species composition, metabolic activity, pathogen detection
- **Ombre** (formerly Thryve): Bacteria composition and diversity
- **Tiny Health**: Composition and health indicators
- **Thorne**: Microbiome data and pathogens
- **Manual**: User-entered structured data

#### Analysis Features:
- **Diversity Calculation**: Shannon Index, Simpson Index, Species Richness
- **Phyla Distribution**: Calculates percentages for major phyla
- **Beneficial Bacteria Identification**: Automatically identifies and extracts abundance of key beneficial species
- **Pathogen Detection**: Identifies and categorizes pathogens by risk level
- **SCFA Producer Identification**: Identifies bacteria that produce butyrate, propionate, or acetate
- **Health Risk Assessment**: 
  - Inflammation risk calculation based on Proteobacteria and beneficial bacteria ratios
  - Gut permeability risk based on Akkermansia levels
  - Digestion score based on diversity and beneficial bacteria

### 3. Fermentation Prediction Engine (`lib/microbiome/fermentation-predictor.ts`)

#### SCFA Production Prediction
Predicts production of three key short-chain fatty acids:

**Butyrate Prediction:**
- Primary sources: Resistant starch (especially RS3), fiber, inulin
- Peak time: 8-12 hours (varies by substrate type)
- Duration: 12-24 hours
- Personalized based on user's butyrate-producing bacteria abundance

**Propionate Prediction:**
- Primary sources: Pectins, resistant starch type 2
- Peak time: 6-10 hours
- Duration: 8-16 hours
- Personalized based on user's propionate-producing bacteria

**Acetate Prediction:**
- Primary sources: Most fermentable substrates
- Peak time: 4-8 hours (fastest fermentation)
- Duration: 6-12 hours
- Most abundant SCFA

#### Features:
- **Meal Composition Input**: Accepts resistant starch (types 1, 2, 3), polyphenols, fiber, inulin, FOS, pectins
- **Personalized Predictions**: Adjusts predictions based on user's microbiome composition
- **Timing Recommendations**: Suggests optimal meal timing for fermentation benefits
- **Actionable Recommendations**: Provides specific dietary suggestions to optimize SCFA production

### 4. Gut-Brain Axis Tracking (`lib/microbiome/gut-brain-axis.ts`)

#### Mood Correlation Analysis
Calculates Pearson correlation coefficients between:
- Microbiome diversity ↔ Mood
- Microbiome diversity ↔ Stress
- Microbiome diversity ↔ Anxiety
- Specific bacteria ↔ Mood (Akkermansia, Bifidobacterium, Lactobacillus, Faecalibacterium)
- Inflammation risk ↔ Mood

#### Neurotransmitter Precursor Analysis:

**Serotonin Precursor Analysis:**
- Tryptophan availability assessment
- Serotonin production potential (0-100)
- Based on Bifidobacterium, Lactobacillus, inflammation, diversity

**Dopamine Precursor Analysis:**
- Tyrosine availability assessment
- Dopamine production potential (0-100)
- Based on inflammation, gut permeability, Akkermansia levels

#### Features:
- **Timeframe Analysis**: Week, month, or quarter correlation analysis
- **Risk Factor Identification**: Identifies patterns that may impact mental health
- **Personalized Recommendations**: Provides specific dietary and lifestyle interventions
- **Data Matching**: Intelligently matches microbiome test dates with nearest mood data points

### 5. API Endpoints

#### `/api/microbiome/upload` (POST)
- Uploads microbiome test results from any supported source
- Parses and analyzes test data automatically
- Stores results in database with all calculated metrics
- Returns processed results with health indicators

**Request Body:**
```typescript
{
  userId: string;
  testData: {
    source: 'viome' | 'ombre' | 'tiny_health' | 'thorne' | 'manual';
    sourceId?: string;
    testDate?: string;
    notes?: string;
  };
  rawData?: any; // Raw test results from provider
  pdfUrl?: string; // Link to original test PDF
}
```

#### `/api/microbiome/analyze` (GET)
- Retrieves microbiome results for a user
- Calculates trends over time (improving, declining, stable)
- Generates personalized insights and recommendations
- Returns latest result or specific result by ID

**Query Parameters:**
- `userId`: User ID (required)
- `resultId`: Specific result ID (optional)

**Response:**
- Latest or specified microbiome result
- Trend analysis (diversity, inflammation)
- Personalized insights and recommendations

#### `/api/microbiome/fermentation` (POST)
- Predicts SCFA production from meal composition
- Personalizes predictions based on user's microbiome
- Provides timing recommendations

**Request Body:**
```typescript
{
  userId: string;
  mealComposition: {
    resistantStarch?: { type1?: number; type2?: number; type3?: number };
    polyphenols?: { total?: number; ... };
    fiber?: number;
    inulin?: number;
    fructooligosaccharides?: number;
    pectins?: number;
  };
}
```

**Response:**
- Predicted butyrate, propionate, acetate production
- Peak times and durations
- Total SCFA production
- Recommendations for optimization
- Optimal meal timing suggestions

#### `/api/microbiome/correlations` (GET)
- Analyzes gut-brain axis correlations
- Provides neurotransmitter precursor analysis
- Identifies risk factors

**Query Parameters:**
- `userId`: User ID (required)
- `timeframe`: 'week' | 'month' | 'quarter' (default: 'month')

**Response:**
- Correlation coefficients for diversity-mood, diversity-stress, etc.
- Serotonin precursor analysis
- Dopamine precursor analysis
- Recommendations
- Risk factors

### 6. Microbiome Dashboard UI (`app/microbiome/page.tsx`)

#### Features:

**Diversity Score Display:**
- Large Shannon Index display
- Status indicator (Excellent, Good, Fair, Low)
- Trend indicators (Improving, Declining, Stable)
- Color-coded status badges

**Phyla Distribution Visualization:**
- Horizontal bar charts for each major phylum
- Percentage displays
- Color-coded phyla (Firmicutes: blue, Bacteroidetes: green, etc.)

**Health Indicators:**
- Inflammation risk gauge (0-10 scale)
- Gut permeability risk gauge (0-10 scale)
- Digestion score (0-100)
- Color-coded risk levels

**Beneficial Bacteria Display:**
- Percentage cards for key beneficial species
- Color-coded by bacteria type
- Visual emphasis on important markers

**Insights & Recommendations:**
- Bulleted list of personalized insights
- Actionable recommendations
- Based on current results and trends

**Gut-Brain Axis Correlations:**
- Timeframe selector (week, month, quarter)
- Correlation coefficient displays
- Serotonin production potential score
- Dopamine production potential score

**Pathogen Alerts:**
- Red alert box for detected pathogens
- Lists pathogen names and risk levels
- Recommendations to consult healthcare provider

**Empty State:**
- Helpful message when no data exists
- Upload button prompt
- Lists supported test providers

### 7. Integration Points

#### Database:
- Uses existing `User`, `SymptomLog`, `HealthData` models for correlations
- New `MicrobiomeResult` model added to schema
- No breaking changes to existing models

#### Authentication:
- Works with both wallet address and email authentication
- Uses existing session management

#### AI Coach:
- Microbiome data can be referenced in AI coach conversations
- Fermentation predictions can inform meal recommendations
- Gut-brain correlations can inform stress management advice

## Technical Implementation Details

### Data Processing Flow:
1. **Upload**: User uploads test results → Parse raw data → Analyze composition
2. **Storage**: Store processed data with calculated metrics → Link to user
3. **Analysis**: Retrieve results → Calculate trends → Generate insights
4. **Prediction**: Take meal composition → Fetch user microbiome → Predict SCFA production
5. **Correlation**: Match microbiome dates with mood data → Calculate correlations → Analyze precursors

### Calculation Methods:
- **Diversity Indices**: Uses standard ecological formulas (Shannon: -Σ(pi * ln(pi)), Simpson: 1-D)
- **Pearson Correlation**: Standard statistical correlation coefficient
- **SCFA Prediction**: Based on substrate types, conversion rates, and user's bacterial abundance
- **Health Risks**: Calculated from phyla ratios, beneficial bacteria levels, and inflammation markers

### Error Handling:
- Graceful fallbacks for missing data
- Validation of test source types
- Handles insufficient data for correlations
- Clear error messages for users

## Files Created

### Library Files:
- `lib/microbiome/analysis.ts` - Microbiome analysis and parsing (600+ lines)
- `lib/microbiome/fermentation-predictor.ts` - SCFA production prediction (500+ lines)
- `lib/microbiome/gut-brain-axis.ts` - Gut-brain axis correlation analysis (700+ lines)

### API Routes:
- `api/microbiome/upload/route.ts` - Upload and process test results
- `api/microbiome/analyze/route.ts` - Analyze results and generate insights
- `api/microbiome/fermentation/route.ts` - Predict SCFA production
- `api/microbiome/correlations/route.ts` - Gut-brain axis correlations

### UI Components:
- `app/microbiome/page.tsx` - Comprehensive microbiome dashboard (500+ lines)

### Database:
- Updated `prisma/schema.prisma` with MicrobiomeResult model

## Files Modified

- `prisma/schema.prisma` - Added MicrobiomeResult model and User relation

## Testing Checklist

- [x] MicrobiomeResult model compiles without errors
- [x] Test parsing works for all supported sources
- [x] Diversity calculations are accurate
- [x] Fermentation predictions generate reasonable outputs
- [x] Correlations calculate correctly
- [x] Dashboard displays all data correctly
- [x] Error handling works for missing data
- [x] All API endpoints respond correctly
- [x] UI handles empty states gracefully

## Next Steps (Future Enhancements)

1. **PDF Parsing**: OCR-based parsing of PDF test results for automatic data extraction
2. **Test Provider Integration**: Direct API integration with Viome, Ombre, etc.
3. **Historical Trend Charts**: Visual timeline of diversity and health indicators
4. **Fermentation Optimization**: Meal planning based on predicted SCFA production
5. **Gut-Brain Dashboard**: Dedicated page for mental health correlations
6. **Microbiome Recommendations Engine**: AI-powered suggestions based on results
7. **Community Comparisons**: Anonymized comparisons with similar users
8. **Intervention Tracking**: Track how dietary changes affect microbiome over time

## Success Metrics

- ✅ MicrobiomeResult model created with comprehensive fields
- ✅ Multi-source test parsing implemented
- ✅ Fermentation prediction engine functional
- ✅ Gut-brain axis correlation analysis working
- ✅ All API endpoints created and tested
- ✅ Comprehensive dashboard UI implemented
- ✅ Zero linting errors
- ✅ All calculations mathematically sound

---

**Phase 5 Complete!** Users can now upload, analyze, and track their microbiome health with advanced fermentation prediction and gut-brain axis correlation capabilities.

