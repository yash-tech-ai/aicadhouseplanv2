import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');

export interface ImageProcessingResult {
  type: 'image' | 'pdf';
  dimensions: {
    width: number;
    height: number;
  };
  extractedText: string;
  detectedParameters: {
    plotSize?: number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    dimensions?: string[];
    rooms?: string[];
  };
  confidence: number;
}

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  /**
   * Process image file (PNG, JPG, JPEG)
   */
  async processImage(filePath: string): Promise<ImageProcessingResult> {
    try {
      this.logger.log(`Processing image: ${filePath}`);

      // Get image metadata
      const metadata = await sharp(filePath).metadata();

      // Extract text using OCR
      const extractedText = await this.performOCR(filePath);

      // Detect parameters from extracted text
      const detectedParameters = this.extractParametersFromText(extractedText);

      return {
        type: 'image',
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
        extractedText,
        detectedParameters,
        confidence: this.calculateConfidence(detectedParameters),
      };
    } catch (error) {
      this.logger.error(`Error processing image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process PDF file
   */
  async processPDF(filePath: string): Promise<ImageProcessingResult> {
    try {
      this.logger.log(`Processing PDF: ${filePath}`);

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      const extractedText = pdfData.text;
      const detectedParameters = this.extractParametersFromText(extractedText);

      return {
        type: 'pdf',
        dimensions: {
          width: 0,
          height: 0,
        },
        extractedText,
        detectedParameters,
        confidence: this.calculateConfidence(detectedParameters),
      };
    } catch (error) {
      this.logger.error(`Error processing PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process file (auto-detect type and route to appropriate processor)
   */
  async processFile(filePath: string): Promise<ImageProcessingResult> {
    const fileInfo = this.isImageOrPDF(filePath);

    if (fileInfo.type === 'image') {
      return this.processImage(filePath);
    } else if (fileInfo.type === 'pdf') {
      return this.processPDF(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileInfo.type}`);
    }
  }

  /**
   * Perform OCR on image
   */
  private async performOCR(imagePath: string): Promise<string> {
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(imagePath);
      await worker.terminate();
      return text;
    } catch (error) {
      this.logger.error(`OCR error: ${error.message}`);
      return '';
    }
  }

  /**
   * Extract parameters from text using NLP and regex patterns
   */
  private extractParametersFromText(text: string): ImageProcessingResult['detectedParameters'] {
    const parameters: ImageProcessingResult['detectedParameters'] = {
      dimensions: [],
      rooms: [],
    };

    // Convert to lowercase for easier matching
    const lowerText = text.toLowerCase();

    // Extract plot size (various patterns)
    const plotSizePatterns = [
      /plot\s*(?:size|area)?[:\s]*(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i,
      /(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)\s*plot/i,
      /area[:\s]*(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft)/i,
    ];

    for (const pattern of plotSizePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        parameters.plotSize = parseFloat(match[1]);
        break;
      }
    }

    // Extract bedrooms
    const bedroomPatterns = [
      /(\d+)\s*(?:bed|bedroom|br|bhk)/i,
      /(\d+)\s*bhk/i,
    ];

    for (const pattern of bedroomPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        parameters.bedrooms = parseInt(match[1], 10);
        break;
      }
    }

    // Extract bathrooms
    const bathroomPatterns = [
      /(\d+)\s*(?:bath|bathroom|washroom)/i,
    ];

    for (const pattern of bathroomPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        parameters.bathrooms = parseInt(match[1], 10);
        break;
      }
    }

    // Extract floors/stories
    const floorPatterns = [
      /(\d+)\s*(?:floor|storey|story|stories|floors)/i,
      /ground\s*\+\s*(\d+)/i,
    ];

    for (const pattern of floorPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        parameters.floors = parseInt(match[1], 10) + 1; // Add ground floor
        break;
      }
    }

    // Extract dimensions (e.g., "30' x 40'", "30 x 40", "30ft x 40ft")
    const dimensionPattern = /(\d+(?:\.\d+)?)\s*(?:'|ft|feet)?\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(?:'|ft|feet)?/g;
    let dimensionMatch;
    while ((dimensionMatch = dimensionPattern.exec(text)) !== null) {
      parameters.dimensions!.push(`${dimensionMatch[1]} x ${dimensionMatch[2]}`);
    }

    // Extract room names
    const roomKeywords = ['bedroom', 'bathroom', 'kitchen', 'living room', 'dining', 'hall', 'porch', 'balcony', 'terrace', 'garage', 'study', 'utility'];
    for (const room of roomKeywords) {
      if (lowerText.includes(room)) {
        if (!parameters.rooms!.includes(room)) {
          parameters.rooms!.push(room);
        }
      }
    }

    return parameters;
  }

  /**
   * Calculate confidence score based on detected parameters
   */
  private calculateConfidence(parameters: ImageProcessingResult['detectedParameters']): number {
    let score = 0;
    let total = 0;

    // Check each parameter and assign weight
    if (parameters.plotSize !== undefined) {
      score += 30;
    }
    total += 30;

    if (parameters.bedrooms !== undefined) {
      score += 25;
    }
    total += 25;

    if (parameters.bathrooms !== undefined) {
      score += 20;
    }
    total += 20;

    if (parameters.floors !== undefined) {
      score += 15;
    }
    total += 15;

    if (parameters.dimensions && parameters.dimensions.length > 0) {
      score += 10;
    }
    total += 10;

    return total > 0 ? Math.round((score / total) * 100) : 0;
  }

  /**
   * Enhance image quality for better OCR
   */
  async enhanceImageForOCR(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen()
      .toFile(outputPath);
  }

  /**
   * Generate thumbnail from image or PDF
   */
  async generateThumbnail(inputPath: string, outputPath: string, width = 400): Promise<void> {
    const ext = path.extname(inputPath).toLowerCase();

    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      await sharp(inputPath)
        .resize(width, null, { fit: 'inside' })
        .toFile(outputPath);
    } else if (ext === '.pdf') {
      // For PDFs, we'll just create a placeholder thumbnail
      // In production, you'd use pdf2pic or similar
      await sharp({
        create: {
          width: 400,
          height: 300,
          channels: 4,
          background: { r: 240, g: 240, b: 240, alpha: 1 },
        },
      })
        .png()
        .toFile(outputPath);
    }
  }

  /**
   * Detect if file is an image or PDF
   */
  isImageOrPDF(filename: string): { isValid: boolean; type: 'image' | 'pdf' | 'cad' | 'unknown' } {
    const ext = path.extname(filename).toLowerCase();

    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      return { isValid: true, type: 'image' };
    }

    if (ext === '.pdf') {
      return { isValid: true, type: 'pdf' };
    }

    if (['.dxf', '.dwg'].includes(ext)) {
      return { isValid: true, type: 'cad' };
    }

    return { isValid: false, type: 'unknown' };
  }
}
