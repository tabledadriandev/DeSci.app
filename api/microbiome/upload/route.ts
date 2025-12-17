import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { microbiomeAnalyzer, MicrobiomeTestData } from '@/lib/microbiome/analysis';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, testData, rawData, pdfUrl } = await request.json();

    if (!userId || !testData) {
      return NextResponse.json(
        { error: 'User ID and test data required' },
        { status: 400 }
      );
    }

    // Validate test source
    const validSources = ['viome', 'ombre', 'tiny_health', 'thorne', 'manual'];
    if (!validSources.includes(testData.source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse and analyze the test data
    const processedData = await microbiomeAnalyzer.parseTestData({
      source: testData.source,
      sourceId: testData.sourceId,
      testDate: new Date(testData.testDate || Date.now()),
      rawData: rawData || testData.rawData || {},
    });

    // Identify SCFA producers
    const speciesComposition = testData.speciesComposition || rawData?.species || [];
    const scfaProducers = microbiomeAnalyzer.identifySCFAProducers(speciesComposition);

    // Create microbiome result in database
    const microbiomeResult = await prisma.microbiomeResult.create({
      data: {
        userId,
        source: testData.source,
        sourceId: testData.sourceId || null,
        testDate: new Date(testData.testDate || Date.now()),
        uploadedAt: new Date(),
        
        // Diversity metrics
        shannonIndex: processedData.shannonIndex,
        simpsonIndex: processedData.simpsonIndex,
        speciesRichness: processedData.speciesRichness,
        
        // Phyla percentages
        firmicutesPercentage: processedData.firmicutesPercentage,
        bacteroidetesPercentage: processedData.bacteroidetesPercentage,
        actinobacteriaPercentage: processedData.actinobacteriaPercentage,
        proteobacteriaPercentage: processedData.proteobacteriaPercentage,
        verrucomicrobiaPercentage: processedData.verrucomicrobiaPercentage,
        otherPercentage: processedData.otherPercentage,
        
        // Beneficial bacteria
        akkermansiaMuciniphila: processedData.akkermansiaMuciniphila,
        bifidobacterium: processedData.bifidobacterium,
        lactobacillus: processedData.lactobacillus,
        faecalibacteriumPrausnitzii: processedData.faecalibacteriumPrausnitzii,
        
        // Pathogens
        pathogens: processedData.pathogens || [],
        
        // SCFA producers
        scfaProducers: scfaProducers,
        
        // Species composition
        speciesComposition: speciesComposition,
        
        // Health indicators
        inflammationRisk: processedData.inflammationRisk,
        gutPermeabilityRisk: processedData.gutPermeabilityRisk,
        digestionScore: processedData.digestionScore,
        
        // Raw data and metadata
        rawData: rawData || testData.rawData || {},
        pdfUrl: pdfUrl || null,
        notes: testData.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      microbiomeResult,
      message: 'Microbiome test result uploaded and analyzed successfully.',
    });
  } catch (error: any) {
    console.error('Microbiome upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload microbiome result' },
      { status: 500 }
    );
  }
}

